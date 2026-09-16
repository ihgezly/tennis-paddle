import { draftMode, headers } from "next/headers";

import type { Media } from "@/lib/core/types/payload-types";

import { Header } from "@/components/shared/wrappers";
import DAL from "@/lib/core/dal";

export default async function HeaderWrapper({ logo }: { logo?: Media }) {
  const { isEnabled } = await draftMode();

  // 1) Products (with fallback)
  let products: any[] = [];
  try {
    products = await DAL.queryAllProducts();
  } catch {
    products = [];
  }

  // 2) Current user (with fallback)
  let user: any = null;
  try {
    const headersList = await headers();
    const req = new Request("http://local", { headers: headersList });
    user = await DAL.queryCurrentUser(req);
  } catch {
    user = null;
  }

  return (
    <Header
      logo={logo}
      products={products}
      user={user}
      adminBarProps={{ preview: isEnabled }}
    />
  );
}