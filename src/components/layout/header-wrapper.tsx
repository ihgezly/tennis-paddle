import { draftMode } from "next/headers";

import type { Media } from "@/lib/core/types/payload-types";

import { Header } from "@/components/shared/wrappers";
import DAL from "@/lib/core/dal";

export default async function HeaderWrapper({ logo }: { logo?: Media }) {
  const { isEnabled } = await draftMode();

  let products: any[] = [];
  try {
    products = await DAL.queryAllProducts();
  } catch {
    products = [];
  }

  return (
    <Header
      logo={logo}
      products={products}
      adminBarProps={{ preview: isEnabled }}
    />
  );
}