import { headers } from "next/headers";
import { redirect } from "next/navigation";

import DAL from "@/lib/core/dal";

export const dynamic = "force-dynamic";

export default async function AccountRouterPage() {
  const headersList = await headers();
  const req = new Request("http://local", { headers: headersList });
  const user = await DAL.queryCurrentUser(req);

  if (!user) {
    redirect("/login");
  }

  if (user.roles?.includes("admin")) {
    redirect("/admin");
  }

  redirect("/account/orders");
}