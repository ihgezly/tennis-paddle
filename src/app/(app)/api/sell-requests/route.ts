import { getPayload } from "payload";
import configPromise from "@payload-config";
import { NextResponse } from "next/server";
import { sellRequestSchema, formatZodError } from "@/lib/core/validation";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/core/rate-limit";
import { CollectionName } from "@/lib/core/types/types";
import { logAudit } from "@/lib/core/audit";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`sell-request:${ip}`, RATE_LIMITS.sellRequest);
  if (!rate.allowed) return NextResponse.json({ message: "Too many requests" }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = sellRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: formatZodError(parsed.error) }, { status: 400 });
  }

  const payload = await getPayload({ config: configPromise });

  // ✅ الطريقة الصحيحة للتحقق من المستخدم في Payload
  const { user } = await payload.auth({ headers: req.headers });

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // منع العميل من تمرير أي حقول حساسة (status, offeredPrice, adminNotes...)
  const {
    category,
    conditionType,
    conditionGrade,
    images,
    ...safeData
  } = parsed.data;

  const customerId = Number(user.id);
  if (!Number.isInteger(customerId)) {
    return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
  }

  try {
    const data = {
      ...safeData,
      customer: customerId,
      category: Number(category),
      conditionType: Number(conditionType),
      conditionGrade: conditionGrade ? Number(conditionGrade) : undefined,
      images: images.map((img) => ({
        image: Number(img.image),
      })),
      status: "pending" as const,
    };

    const sellRequest = await payload.create({
      collection: CollectionName.sellRequests,
      data,
      overrideAccess: true,
      // لا نحتاج overrideAccess لو حسبنا الـ Access Control من الأول،
      // لكن نبقيه هنا مع التحقق الصارم من المستخدم أعلاه.
    });

    await logAudit(
      { payload } as any,
      {
        action: "sell_request.created",
        entity: CollectionName.sellRequests,
        entityId: String(sellRequest.id),
        after: { status: "pending", askingPrice: parsed.data.askingPrice },
      },
    );

    return NextResponse.json({ doc: sellRequest }, { status: 201 });
  } catch (error: any) {
    console.error("SELL REQUEST ERROR:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to submit sell request" },
      { status: 500 },
    );
  }
}