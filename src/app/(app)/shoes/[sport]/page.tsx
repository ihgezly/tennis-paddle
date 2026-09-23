import { notFound } from "next/navigation";

import type { Metadata } from "next";

import SportPageLayout from "@/components/sport/sport-page-layout";
import DAL from "@/lib/core/dal";
import { SportType } from "@/lib/core/types/types";

export const dynamic = "force-static";
export const revalidate = false;

type Params = Promise<{ sport: string }>;
type SearchParams = Promise<{
  page?: string;
  brand?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  q?: string;
  sort?: string;
}>;

const VALID_SPORTS = [SportType.PADEL, SportType.TENNIS];

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { sport } = await params;
  if (!VALID_SPORTS.includes(sport as SportType)) {
    return { robots: "noindex" };
  }
  const label = sport === SportType.PADEL ? "بادل" : "تنس";
  return {
    title: `أحذية ${label}`,
    description: `أحذية ${label} من Ace Gear Store.`,
  };
}

export default async function ShoesBySportPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { sport } = await params;

  if (!VALID_SPORTS.includes(sport as SportType)) {
    return notFound();
  }

  const sportType = sport as SportType;
  const filters = await searchParams;
  const page = Math.max(1, Number(filters.page || 1));
  const limit = 12;

  const productTypes = await DAL.queryProductTypes();
  const shoesType = productTypes.find(
    (pt) => pt.slug === "shoes" || pt.title === "أحذية",
  );

  const [allProductTypes, brands] = await Promise.all([
    DAL.queryProductTypesBySport(sportType),
    DAL.queryDistinctBrands(null),
  ]);

  const { products, totalCount } = await DAL.runSportProducts(null, {
    sportType,
    productTypeId: shoesType?.id ?? null,
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
  const label = sportType === SportType.PADEL ? "بادل" : "تنس";

  return (
    <SportPageLayout
      sport={sportType}
      title={`أحذية ${label}`}
      subtitle={`كل أحذية ${label} المتاحة`}
      basePath={`/shoes/${sport}`}
      breadcrumb={[
        { label: "الأحذية", href: "/shoes" },
        { label, href: `/shoes/${sport}` },
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