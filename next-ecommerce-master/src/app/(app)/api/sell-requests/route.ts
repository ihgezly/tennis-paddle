import { getPayload } from "payload";
import configPromise from "@payload-config";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sellRequestSchema, formatZodError } from "@/lib/core/validation";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/core/rate-limit";
import { CollectionName } from "@/lib/core/types/types";
import { logAudit } from "@/lib/core/audit";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`sell-request:${ip}`, RATE_LIMITS.sellRequest);
  if (!rate.allowed) return NextResponse.json({ message: "Too many requests" }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ message: "Invalid JSON" }, { status: 400 }); }

  const parsed = sellRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: formatZodError(parsed.error) }, { status: 400 });

  const cookieStore = await import("next/headers").then(m => m.cookies());
  const token = cookieStore.get("payload-token")?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  let userId: string | null = null;
  try {
    const decoded = jwt.verify(token, process.env.PAYLOAD_SECRET || "") as { id: string };
    userId = decoded.id;
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  try {
    const payload = await getPayload({ config: configPromise });
    const sellRequest = await payload.create({
      collection: CollectionName.sellRequests,
      data: { ...parsed.data, customer: userId, status: "pending" },
      overrideAccess: true,
    });
    await logAudit({ payload } as any, { action: "sell_request.created", entity: CollectionName.sellRequests, entityId: String(sellRequest.id), after: { status: "pending" } });
    return NextResponse.json({ doc: sellRequest }, { status: 201 });
  } catch (error: any) {
    console.error("SELL REQUEST ERROR:", error);
    return NextResponse.json({ message: error?.message || "Failed to submit sell request" }, { status: 500 });
  }
}