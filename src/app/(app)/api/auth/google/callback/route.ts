import { NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

import appConfig from "@/lib/core/config";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      `${appConfig.BASE_URL}/login?error=google_denied`,
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${appConfig.BASE_URL}/login?error=not_configured`,
    );
  }

  const redirectUri = `${appConfig.BASE_URL}/api/auth/google/callback`;

  // 1) Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(
      `${appConfig.BASE_URL}/login?error=token_exchange_failed`,
    );
  }

  const tokenData = (await tokenRes.json()) as { access_token: string };

  // 2) Fetch Google user info
  const userInfoRes = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    },
  );

  if (!userInfoRes.ok) {
    return NextResponse.redirect(
      `${appConfig.BASE_URL}/login?error=userinfo_failed`,
    );
  }

  const googleUser = (await userInfoRes.json()) as {
    email: string;
    name?: string;
    verified_email?: boolean;
  };

  if (!googleUser.email) {
    return NextResponse.redirect(
      `${appConfig.BASE_URL}/login?error=no_email`,
    );
  }

  // 3) Find or create Payload user
  const payload = await getPayload({ config: configPromise });
  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: googleUser.email } },
    limit: 1,
  });

  let user = existing.docs[0];

  // ✅ لو اليوزر جديد بس: ننشئه بـpassword عشوائي (مش هنستخدمه تاني)
  // لو موجود من قبل → منلمسش الـpassword خالص
  if (!user) {
    const randomPass = randomBytes(32).toString("hex") + "Aa1!";
    user = await payload.create({
      collection: "users",
      data: {
        email: googleUser.email,
        password: randomPass,
        name: googleUser.name ?? undefined,
        roles: ["customer"],
      } as any,
    });
  }

  // 4) Sign JWT يدوياً بنفس توقيع Payload
  // (نتجنب payload.login لما اليوزر مش عنده password معروف)
  const token = jwt.sign(
    {
      id: user.id,
      collection: "users",
      email: user.email,
    },
    process.env.PAYLOAD_SECRET!,
    { expiresIn: "30d" },
  );

  // 5) Determine destination
  const isAdmin = Array.isArray(user.roles) && user.roles.includes("admin");
  const dest = isAdmin ? "/admin" : "/account/orders";

  const res = NextResponse.redirect(`${appConfig.BASE_URL}${dest}`);
  res.cookies.set("payload-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}