import type { Metadata } from "next";

import SportPageLayout from "@/components/sport/sport-page-layout";
import DAL from "@/lib/core/dal";
import { SportType } from "@/lib/core/types/types";

export const dynamic = "force-static";
export const revalidate = false;

export const metadata: Metadata = {
  title: "تنس",
  description: "كل منتجات التنس — مضارب، كرات، شنط، وأحذية تنس.",
};

type SearchParams = {
  page?: string;
  brand?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  q?: string;
  sort?: string;
};

export default async function TennisPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = await searchParams;
  const page = Math.max(1, Number(filters.page || 1));
  const limit = 12;

  const [productTypes, brands] = await Promise.all([
    DAL.queryProductTypesBySport(SportType.TENNIS),
    DAL.queryDistinctBrands(null),
  ]);

  const { products, totalCount } = await DAL.runSportProducts(null, {
    sportType: SportType.TENNIS,
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
      sport={SportType.TENNIS}
      title="تنس"
      subtitle="كل ما تحتاجه للعب التنس — مضارب، كرات، أحذية، وشنط."
      basePath="/tennis"
      productTypes={productTypes}
      products={products}
      totalCount={totalCount}
      brands={brands}
      currentPage={page}
      totalPages={totalPages}
      searchParams={filters}
    />
  );
}