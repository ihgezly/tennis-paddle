import { NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";
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

  if (!user) {
    // Create with a random password (user won't use it — they use Google)
    const randomPass = randomBytes(32).toString("hex") + "Aa1!";
    user = await payload.create({
      collection: "users",
      data: {
        email: googleUser.email,
        password: randomPass,
        roles: ["customer"],
      } as any,
    });
  }

  // 4) Rotate password and call Payload's official login to get a valid JWT
  const tempPassword = randomBytes(32).toString("hex") + "Aa1!";
  await payload.update({
    collection: "users",
    id: user.id,
    data: { password: tempPassword } as any,
    overrideAccess: true,
  });

  const loginResult = await payload.login({
    collection: "users",
    data: { email: googleUser.email, password: tempPassword },
  });

  if (!loginResult?.token) {
    return NextResponse.redirect(
      `${appConfig.BASE_URL}/login?error=session_failed`,
    );
  }

  // 5) Determine destination
  const isAdmin = Array.isArray(user.roles) && user.roles.includes("admin");
  const dest = isAdmin ? "/admin" : "/account/orders";

  const res = NextResponse.redirect(`${appConfig.BASE_URL}${dest}`);
  res.cookies.set("payload-token", loginResult.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return res;
}