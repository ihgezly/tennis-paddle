import { getPayload } from "payload";
import configPromise from "@payload-config";
import { NextResponse } from "next/server";
import { sellRequestSchema, formatZodError } from "@/lib/core/validation";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/core/rate-limit";
import { CollectionName } from "@/lib/core/types/types";
import { logAudit } from "@/lib/core/audit";
import { requireUser } from "@/lib/auth/get-current-user";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`sell-request:${ip}`, RATE_LIMITS.sellRequest);
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

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

  try {
    // ✅ توحيد الـ Auth
    const user = await requireUser(req);
    const payload = await getPayload({ config: configPromise });

    // منع العميل من تمرير حقول حساسة
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

    if (error?.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { message: error?.message || "Failed to submit sell request" },
      { status: 500 },
    );
  }
}