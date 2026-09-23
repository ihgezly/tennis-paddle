import { notFound } from "next/navigation";

import type { Metadata } from "next";

import SportPageLayout from "@/components/sport/sport-page-layout";
import DAL from "@/lib/core/dal";
import { SportQueries } from "@/lib/core/dal/sport-queries";
import { SportType } from "@/lib/core/types/types";

export const dynamic = "force-static";
export const revalidate = false;

type Params = Promise<{ type: string }>;
type SearchParams = Promise<{
  page?: string;
  brand?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  q?: string;
  sort?: string;
}>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { type } = await params;
  const productType = await SportQueries.queryProductTypeBySlug(type);

  if (!productType) return { robots: "noindex" };

  return {
    title: `${productType.title} — بادل`,
    description: `${productType.title} بادل من Ace Gear Store.`,
  };
}

export default async function PadelTypePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { type } = await params;
  const filters = await searchParams;

  const productType = await SportQueries.queryProductTypeBySlug(type);
  if (!productType) return notFound();

  const page = Math.max(1, Number(filters.page || 1));
  const limit = 12;

  const [allProductTypes, brands] = await Promise.all([
    DAL.queryProductTypesBySport(SportType.PADEL),
    DAL.queryDistinctBrands(null),
  ]);

  const { products, totalCount } = await DAL.runSportProducts(null, {
    sportType: SportType.PADEL,
    productTypeId: productType.id,
    page,
    limit,
    brand: filters.brand,
    condition: filters.condition,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    search: filters.q,
    sort: filters.sort,
  });

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <SportPageLayout
      sport={SportType.PADEL}
      title={productType.title}
      subtitle={`كل ${productType.title} البادل المتاحة`}
      basePath="/padel"
      currentTypeSlug={type}
      breadcrumb={[
        { label: "بادل", href: "/padel" },
        { label: productType.title, href: `/padel/${type}` },
      ]}
      productTypes={allProductTypes}
      products={products}
      totalCount={totalCount}
      brands={brands}
      currentPage={page}
      totalPages={totalPages}
      searchParams={filters}
    />
  );
}