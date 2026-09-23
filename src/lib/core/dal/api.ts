import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";

import type {
  Category,
  Media,
  Product,
  Review,
  SiteSetting,
  User,
  Variant,
  VariantOption,
  VariantType,
} from "@/lib/core/types/payload-types";

import { buildProductPurchaseSectionData } from "@/lib/core/adapter";
import BaseApi from "@/lib/core/dal/base-api";
import {
  type SitemapData,
  type SitemapItem,
  AppConst,
  CollectionName,
  type CombinedVariantData,
  type ProductSinglePage,
} from "@/lib/core/types/types";
import { getRevalidateTag } from "@/lib/core/util";

export default class Api extends BaseApi {
  private static cache<T>(fn: () => Promise<T>, key: string, tag: string) {
    return unstable_cache(fn, [key], {
      revalidate: false,
      tags: [getRevalidateTag(tag)],
    });
  }

  static async queryCurrentUser(req: Request): Promise<User | null> {
    try {
      return await Api.fetchApi<User | null>("users/me", {
        expect: "json",
        req,
      });
    } catch {
      return null;
    }
  }

  private static async queryBySlug<T>(
    collection: CollectionName,
    slug: string,
    depth: number,
    select?: Record<string, true>,
  ): Promise<T | null> {
    const { isEnabled: draft } = await draftMode();

    const params: Record<string, string | number | boolean> = {
      depth,
      limit: 1,
      draft: draft ? "true" : "false",
      "where[and][0][slug][equals]": slug,
    };

    if (!draft) {
      params["where[and][1][_status][equals]"] = "published";
    }

    return Api.fetchApi<T | null>(`${collection}`, {
      params,
      select,
      expect: "first",
      ...(draft ? {} : { tag: `${collection}-${slug}` }),
    });
  }

  private static async queryCombinedVariantData(
    productId: number,
    tag: string,
  ): Promise<CombinedVariantData> {
    const { isEnabled: draft } = await draftMode();

    const variants = await Api.fetchApi<Variant[]>("variants", {
      params: {
        depth: 0,
        limit: 100,
        draft: draft ? "true" : undefined,
        "where[and][0][product][equals]": productId,
        ...(draft ? {} : { "where[and][1][_status][equals]": "published" }),
      },
      select: {
        inventory: true,
        priceInEGP: true,
        originalPriceInEGP: true,
        options: true,
      },
      expect: "docs",
      ...(draft ? {} : { tag }),
    });

    if (!variants.length) {
      return null;
    }

    const optionIds = [
      ...new Set(
        variants.flatMap((variant) => variant.options ?? []).map(String),
      ),
    ];

    const options = await Api.fetchApi<VariantOption[]>("variantOptions", {
      params: {
        depth: 0,
        limit: 200,
        "where[id][in]": optionIds.join(","),
      },
      select: {
        label: true,
        variantType: true,
      },
      expect: "docs",
      ...(draft ? {} : { tag }),
    });

    if (!options.length) {
      return null;
    }

    const typeIds = [
      ...new Set(options.map((option) => String(option.variantType))),
    ];

    const variantTypes = await Api.fetchApi<VariantType[]>("variantTypes", {
      params: {
        depth: 0,
        limit: 200,
        "where[id][in]": typeIds.join(","),
      },
      select: {
        label: true,
      },
      expect: "docs",
      ...(draft ? {} : { tag }),
    });

    if (!variantTypes.length) {
      return null;
    }

    return {
      variants,
      options,
      variantTypes,
    } as CombinedVariantData;
  }

  static queryAllProducts(): Promise<Product[]> {
    return Api.cache(
      async () => {
        const products = await Api.fetchApi<Product[]>(
          `${CollectionName.products}`,
          {
            params: {
              depth: 0,
              sort: "-updatedAt",
              "where[_status][equals]": "published",
            },
            select: {
              title: true,
              slug: true,
              image: true,
              categories: true,
              priceInEGP: true,
              originalPriceInEGP: true,
              conditionType: true,
              conditionGrade: true,
              conditionNotes: true,
              glbModel: true,
              productType: true,
              sportTypes: true,
              status: true,
            },
            expect: "docs",
            tag: AppConst.CACHE_TAG_BOOTSTRAP,
          },
        );

        const imageIds = Array.from(
          new Set(
            products.map((product) => Number(product.image)).filter(Boolean),
          ),
        );

        if (!imageIds.length) {
          return products;
        }

        const media = await Api.fetchApi<Media[]>("media", {
          params: {
            depth: 0,
            "where[id][in]": imageIds.join(","),
          },
          expect: "docs",
          tag: AppConst.CACHE_TAG_BOOTSTRAP,
        });

        const mediaById = new Map<number, Media>();

        for (const mediaItem of media) {
          mediaById.set(Number(mediaItem.id), mediaItem);
        }

        return products.map((product) => ({
          ...product,
          image: mediaById.get(Number(product.image)) as Media,
        })) as Product[];
      },
      "all-products",
      AppConst.CACHE_TAG_BOOTSTRAP,
    )();
  }

  static async queryProductBySlug(
    slug: string,
  ): Promise<ProductSinglePage | null> {
    const product = await Api.queryBySlug<Product>(
      CollectionName.products,
      slug,
      1,
      {
        title: true,
        description: true,
        updatedAt: true,
        gallery: true,
        priceInEGP: true,
        originalPriceInEGP: true,
        inventory: true,
        faqs: true,
        reviews: true,
        enableVariants: true,
        conditionType: true,
        conditionGrade: true,
        conditionNotes: true,
        glbModel: true,
        brand: true,
        categories: true,
        sportTypes: true,
        productType: true,
        status: true,
      },
    );

    if (!product) {
      return null;
    }

    const tag = `${CollectionName.products}-${slug}`;

    const relatedProductDoc = await Api.queryBySlug<Product>(
      CollectionName.products,
      slug,
      0,
      {
        relatedProducts: true,
      },
    );

    const relatedIds = (relatedProductDoc?.relatedProducts ?? []) as number[];

    let relatedProducts: Product[] = [];

    if (relatedIds.length) {
      const allProducts = await Api.queryAllProducts();
      relatedProducts = allProducts.filter((relatedProduct) =>
        relatedIds.includes(relatedProduct.id),
      );
    }

    const combined = product.enableVariants
      ? await Api.queryCombinedVariantData(product.id, tag)
      : null;
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      updatedAt: product.updatedAt,
      gallery: product.gallery,
      faqs: product.faqs,
      relatedProducts,
      reviews: product.reviews?.docs as Review[],
      purchase_section: buildProductPurchaseSectionData(product, combined),
      conditionType: product.conditionType ?? null,
      conditionGrade: product.conditionGrade ?? null,
      conditionNotes: product.conditionNotes ?? null,
      glbModel: product.glbModel ?? null,
    };
  }

  static queryCategoryBySlug(slug: string): Promise<Category | null> {
    return Api.queryBySlug<Category>(CollectionName.category, slug, 1, {
      title: true,
      image: true,
      slug: true,
      description: true,
      updatedAt: true,
      faqs: true,
    });
  }

  private static async fetchSlugs(
    collection: CollectionName,
  ): Promise<SitemapItem[]> {
    return Api.fetchApi<SitemapItem[]>(`${collection}`, {
      params: {
        depth: 0,
        sort: "-updatedAt",
        "where[_status][equals]": "published",
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      expect: "docs",
      tag: AppConst.CACHE_TAG_SITEMAP,
    });
  }

  static async querySitemapData(): Promise<SitemapData> {
    const [products, categories] = await Promise.all([
      Api.fetchSlugs(CollectionName.products),
      Api.fetchSlugs(CollectionName.category),
    ]);

    return { products, categories };
  }

  static querySiteSettings(): Promise<SiteSetting> {
    return Api.cache(
      () =>
        Api.fetchApi<SiteSetting>("globals/site-settings", {
          params: {
            depth: 2,
          },
          expect: "json",
          tag: "site-settings",
        }),
      "site-settings",
      "site-settings",
    )();
  }

  static queryCategoriesBasic(): Promise<Category[]> {
    return Api.cache(
      () =>
        Api.fetchApi<Category[]>(`${CollectionName.category}`, {
          params: {
            depth: 0,
            sort: "position",
            "where[_status][equals]": "published",
          },
          select: {
            id: true,
            title: true,
            slug: true,
          },
          expect: "docs",
          tag: AppConst.CACHE_TAG_BOOTSTRAP,
        }),
      "categories-basic",
      AppConst.CACHE_TAG_BOOTSTRAP,
    )();
  }
}