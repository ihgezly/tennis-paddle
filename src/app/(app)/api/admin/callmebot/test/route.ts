import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { testCallmebot } from "@/lib/core/whatsapp";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await getCurrentUser(req);
  if (!user?.roles?.includes("admin")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const result = await testCallmebot();

  if (!result.success) {
    return NextResponse.json(
      { success: false, message: result.error ?? "Callmebot failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "Test message sent successfully",
  });
}