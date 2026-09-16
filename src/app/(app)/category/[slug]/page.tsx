import CategoryPageLayout from "@/components/category";
import DAL from "@/lib/core/dal";
import { notFound } from "next/navigation";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
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
  const { slug } = await params;
  const filters = await searchParams;

  const category = slug !== "/" ? await DAL.queryCategoryBySlug(slug) : null;
  if (slug !== "/" && !category) return notFound();

  const children = category ? await DAL.queryChildCategories(category.id) : [];

  const page = Math.max(1, Number(filters.page || 1));
  const limit = 12;

  const { products, totalCount } = await DAL.queryCategoryProductsPaginated(
    slug,
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
      title={category ? category.title : "جميع المنتجات"}
      description={category?.description ?? null}
      products={products}
      slug={slug}
      currentPage={page}
      totalPages={totalPages}
      searchParams={filters}
      children={children}
    />
  );
}