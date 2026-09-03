import { getPayload } from "payload";
import configPromise from "@payload-config";

export type AuthUser = {
  id: number;
  email: string;
  roles: ("admin" | "customer")[];
  collection: "users";
  [key: string]: unknown;
};

/**
 * Returns the currently authenticated user from the request headers,
 * or null if unauthenticated/invalid token.
 *
 * This is the ONLY place in the app that should call payload.auth()
 * for user lookups — never verify JWT manually.
 */
export async function getCurrentUser(req: Request): Promise<AuthUser | null> {
  try {
    const payload = await getPayload({ config: configPromise });
    const { user } = await payload.auth({ headers: req.headers });
    if (!user) return null;
    return user as unknown as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Throws if there is no authenticated user.
 * Use in endpoints that require a logged-in customer.
 */
export async function requireUser(req: Request): Promise<AuthUser> {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

/**
 * Throws if the authenticated user is not an admin.
 * Use in admin-only endpoints.
 */
export async function requireAdmin(req: Request): Promise<AuthUser> {
  const user = await requireUser(req);
  if (!user.roles?.includes("admin")) {
    throw new Error("FORBIDDEN");
  }
  return user;
}