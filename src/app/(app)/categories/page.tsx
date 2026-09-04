import CategoryPageLayout from "@/components/category";
import DAL from "@/lib/core/dal";

export default async function AllCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    brand?: string;
    condition?: string;
    minPrice?: string;
    maxPrice?: string;
    q?: string;
    sort?: string;
  }>;
}) {
  const filters = await searchParams;

  const page = Math.max(1, Number(filters.page || 1));
  const limit = 12;

  const { products, totalCount } = await DAL.queryCategoryProductsPaginated(
    "/",
    {
      page,
      limit,
      brand: filters.brand,
      condition: filters.condition,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      search: filters.q,
      sort: filters.sort,
    },
  );

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <CategoryPageLayout
      title="All Products"
      description={null}
      products={products}
      slug="/"
      currentPage={page}
      totalPages={totalPages}
      searchParams={filters}
    />
  );
}