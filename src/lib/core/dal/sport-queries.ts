import type { Media, Product } from "@/lib/core/types/payload-types";

import Queries from "@/lib/core/dal/queries";
import {
  CollectionName,
  ProductStatus,
  SportType,
  type ProductType,
} from "@/lib/core/types/types";

/**
 * Queries خاصة بالـSport-based routes
 * بتستخدم Payload مباشرة + unstable_cache من خلال Queries
 */

type SportProductsOptions = {
  sportType?: SportType | null;
  productTypeId?: number | null;
  brand?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

export class SportQueries {
  /**
   * يجيب منتجات حسب (sport + productType + الفلاتر)
   * بيستبعد دايماً المنتجات المباعة (sold)
   */
  static async queryProducts(
    options: SportProductsOptions,
  ): Promise<{ products: Product[]; totalCount: number }> {
    const payload = await (Queries as any).getPayloadPublic();
    return (Queries as any).runSportProducts(payload, options);
  }

  /**
   * يجيب ProductType عن طريق slug
   */
  static async queryProductTypeBySlug(
    slug: string,
  ): Promise<ProductType | null> {
    const payload = await (Queries as any).getPayloadPublic();

    const res = await payload.find({
      collection: CollectionName.productTypes,
      where: {
        and: [
          { slug: { equals: slug } },
          { isActive: { equals: true } },
        ],
      },
      limit: 1,
      pagination: false,
      depth: 1,
    });

    const pt = res.docs?.[0];
    if (!pt) return null;

    return {
      id: pt.id,
      title: pt.title,
      slug: pt.slug,
      sportTypes: pt.sportTypes ?? [],
      icon: pt.icon ?? null,
      position: pt.position ?? 0,
      isActive: pt.isActive ?? true,
      updatedAt: pt.updatedAt,
      createdAt: pt.createdAt,
    };
  }
}