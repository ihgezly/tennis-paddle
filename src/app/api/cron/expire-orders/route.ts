import { NextResponse } from "next/server";

import { expirePendingOrders } from "@/lib/jobs/expire-pending-orders";
import { recoverInitiatingPayments } from "@/lib/jobs/recover-initiating-payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");

  if (expected && auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const started = Date.now();

  try {
    const [expired, recovered] = await Promise.allSettled([
      expirePendingOrders(),
      recoverInitiatingPayments(),
    ]);

    return NextResponse.json({
      ok: true,
      at: new Date().toISOString(),
      durationMs: Date.now() - started,
      expired: expired.status,
      recovered: recovered.status,
    });
  } catch (error) {
    console.error("CRON ERROR:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}