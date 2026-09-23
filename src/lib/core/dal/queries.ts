import configPromise from "@payload-config";
import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import { getPayload as initPayload, type PayloadRequest } from "payload";

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
import {
  type SitemapData,
  type SitemapItem,
  AppConst,
  CollectionName,
  type CombinedVariantData,
  type ProductSinglePage,
  type ProductType,
  SportType,
} from "@/lib/core/types/types";
import { getRevalidateTag } from "@/lib/core/util";

type PayloadInstance = Awaited<ReturnType<typeof initPayload>>;
type PayloadFindArgs = Parameters<PayloadInstance["find"]>[0];
type PayloadFindGlobalArgs = Parameters<PayloadInstance["findGlobal"]>[0];

type PayloadQueryOptions = {
  tag: string;
  cache?: boolean;
};

type PayloadFindOptions = PayloadQueryOptions & {
  collection: PayloadFindArgs["collection"];
  params: Omit<PayloadFindArgs, "collection">;
};

type PayloadGlobalOptions = PayloadQueryOptions & {
  params: PayloadFindGlobalArgs;
};

export default class Queries {
  private static instance: PayloadInstance | null = null;

  private static async getPayload() {
    if (!Queries.instance) {
      Queries.instance = await initPayload({ config: configPromise });
    }
    return Queries.instance;
  }

  private static cache<T>(fn: () => Promise<T>, key: string, tag: string) {
    return unstable_cache(fn, [key], {
      revalidate: false,
      tags: [getRevalidateTag(tag)],
    });
  }

  private static async runPayloadFind<T>({
    collection,
    params,
    tag,
    cache = true,
  }: PayloadFindOptions): Promise<T[]> {
    if (!cache) {
      const payload = await Queries.getPayload();
      const res = await payload.find({
        collection,
        ...params,
      });
      return res.docs as T[];
    }

    return Queries.cache(
      async () => {
        const payload = await Queries.getPayload();
        const res = await payload.find({
          collection,
          ...params,
        });
        return res.docs as T[];
      },
      `${collection}-${tag}-${JSON.stringify(params)}`,
      tag,
    )();
  }

  private static async runPayloadGlobal<T>({
    params,
    tag,
    cache = true,
  }: PayloadGlobalOptions): Promise<T> {
    if (!cache) {
      const payload = await Queries.getPayload();
      return (await payload.findGlobal(params)) as T;
    }

    return Queries.cache(
      async () => {
        const payload = await Queries.getPayload();
        return (await payload.findGlobal(params)) as T;
      },
      `global-${tag}-${JSON.stringify(params)}`,
      tag,
    )();
  }

  static async queryCurrentUser(req: Request): Promise<User | null> {
    try {
      const payload = await Queries.getPayload();
      const user = await payload.auth({
        req: req as unknown as PayloadRequest,
        headers: req.headers,
      });
      return (user?.user as User) ?? null;
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

    const docs = await Queries.runPayloadFind<T>({
      collection: collection as any,
      tag: `${collection}-${slug}`,
      cache: !draft,
      params: {
        depth,
        draft,
        overrideAccess: draft,
        limit: 1,
        pagination: false,
        where: {
          and: [
            { slug: { equals: slug } },
            ...(draft ? [] : [{ _status: { equals: "published" } }]),
          ],
        },
        ...(select ? { select } : {}),
      },
    });

    return docs[0] ?? null;
  }

  private static async queryCombinedVariantData(
    productId: number,
    tag: string,
  ): Promise<CombinedVariantData> {
    const { isEnabled: draft } = await draftMode();

    const variants = await Queries.runPayloadFind<Variant>({
      collection: "variants",
      tag,
      cache: !draft,
      params: {
        depth: 0,
        limit: 20,
        pagination: false,
        where: {
          and: [{ product: { equals: productId } }],
        },
        select: {
          inventory: true,
          priceInEGP: true,
          originalPriceInEGP: true,
          options: true,
        } as any,
      },
    });

    if (!variants.length) return null;

    const optionIds = [
      ...new Set(variants.flatMap((variant) => variant.options).map(String)),
    ];

    const options = await Queries.runPayloadFind<VariantOption>({
      collection: "variantOptions",
      tag,
      cache: !draft,
      params: {
        depth: 0,
        limit: 20,
        pagination: false,
        where: { id: { in: optionIds } },
        select: { label: true, variantType: true },
      },
    });

    if (!options.length) return null;

    const typeIds = [
      ...new Set(options.map((option) => String(option.variantType))),
    ];

    const variantTypes = await Queries.runPayloadFind<VariantType>({
      collection: "variantTypes",
      tag,
      cache: !draft,
      params: {
        depth: 0,
        limit: 20,
        pagination: false,
        where: { id: { in: typeIds } },
        select: { label: true },
      },
    });

    if (!variantTypes.length) return null;

    return {
      variants,
      variantTypes,
      options,
    } as CombinedVariantData;
  }

  private static async getConditionTypeIdByCode(
    code: "new" | "used",
  ): Promise<number | null> {
    const types = await Queries.runPayloadFind<{ id: number; code: string }>({
      collection: "condition-types",
      tag: "condition-types",
      params: {
        limit: 10,
        pagination: false,
        where: { code: { equals: code } },
        select: { id: true, code: true } as any,
      },
    });
    return types[0]?.id ?? null;
  }

  /**
   * ✅ يحوّل قيمة URL (string أو string[] أو undefined) إلى array
   * يدعم: "Nike,Adidas" أو "Nike" أو undefined
   */
  private static parseMultiValue(
    value: string | string[] | undefined,
  ): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);

    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  /**
   * ✅ where builder — يستبعد المنتجات اللي تم بيعها
   * يدعم multi-value للـbrands والـconditions
   */
  private static async buildProductWhere(
    categoryId: number | null,
    filters: {
      brands?: string[];
      conditions?: string[];
      sportTypes?: SportType[];
      productTypeIds?: number[];
      minPrice?: number;
      maxPrice?: number;
      search?: string;
    },
  ) {
    const conditions: any[] = [
      { _status: { equals: "published" } },
      { status: { equals: "available" } },
    ];

    if (categoryId != null) {
      conditions.push({ categories: { in: [categoryId] } });
    }

    if (filters.sportTypes && filters.sportTypes.length > 0) {
      conditions.push({ sportTypes: { in: filters.sportTypes } });
    }

    if (filters.productTypeIds && filters.productTypeIds.length > 0) {
      conditions.push({ productType: { in: filters.productTypeIds } });
    }

    // ✅ multi-condition
    if (filters.conditions && filters.conditions.length > 0) {
      const conditionTypeIds: number[] = [];
      for (const code of filters.conditions) {
        if (code !== "new" && code !== "used") continue;
        const id = await Queries.getConditionTypeIdByCode(code);
        if (id) conditionTypeIds.push(id);
      }
      if (conditionTypeIds.length > 0) {
        conditions.push({ conditionType: { in: conditionTypeIds } });
      }
    }

    // ✅ multi-brand
    if (filters.brands && filters.brands.length > 0) {
      conditions.push({ brand: { in: filters.brands } });
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      conditions.push({
        priceInEGP: {
          ...(filters.minPrice !== undefined && {
            greater_than_equal: filters.minPrice,
          }),
          ...(filters.maxPrice !== undefined && {
            less_than_equal: filters.maxPrice,
          }),
        },
      });
    }

    if (filters.search) {
      conditions.push({ title: { contains: filters.search } });
    }

    return { and: conditions };
  }

  static async queryDistinctBrands(
    categoryId?: number | null,
  ): Promise<string[]> {
    const where: any = {
      _status: { equals: "published" },
      status: { equals: "available" },
    };
    if (categoryId != null) {
      where.categories = { in: [categoryId] };
    }

    const products = await Queries.runPayloadFind<{ brand?: string | null }>({
      collection: CollectionName.products,
      tag: categoryId != null ? `brands-category-${categoryId}` : "brands-all",
      params: {
        draft: false,
        overrideAccess: false,
        limit: 0,
        pagination: false,
        depth: 0,
        where,
        select: { brand: true } as any,
      },
    });

    const brands = new Set<string>();
    for (const product of products) {
      const brand = (product as any).brand?.trim();
      if (brand) brands.add(brand);
    }
    return Array.from(brands).sort();
  }

  static async queryCategoryProductsPaginated(
    slug: string,
    options: {
      page?: number;
      limit?: number;
      brand?: string;
      condition?: string;
      sport?: string;
      type?: string;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
      sort?: string;
    },
  ): Promise<{ products: Product[]; totalCount: number }> {
    const rawPage = Number(options.page);
    const page =
      Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

    const rawLimit = Number(options.limit);
    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0
        ? Math.min(Math.floor(rawLimit), 48)
        : 12;

    const category =
      slug && slug !== "/" ? await Queries.queryCategoryBySlug(slug) : null;
    const categoryId = category?.id ?? null;

    // ✅ multi-value parsing
    const conditionsArray = Queries.parseMultiValue(options.condition);
    const brandsArray = Queries.parseMultiValue(options.brand);
    const sportsArray = Queries.parseMultiValue(options.sport);
    const typesArray = Queries.parseMultiValue(options.type);

    const validSportTypes: SportType[] = sportsArray.filter((s): s is SportType =>
      Object.values(SportType).includes(s as SportType),
    );

    // نحوّل type slugs إلى IDs
    let productTypeIds: number[] = [];
    if (typesArray.length > 0) {
      const allTypes = await Queries.queryProductTypes();
      productTypeIds = allTypes
        .filter((pt) => typesArray.includes(pt.slug))
        .map((pt) => pt.id);
    }

    const where = await Queries.buildProductWhere(categoryId, {
      brands: brandsArray,
      conditions: conditionsArray,
      sportTypes: validSportTypes,
      productTypeIds,
      minPrice: options.minPrice,
      maxPrice: options.maxPrice,
      search: options.search,
    });

    const cacheKey = `${slug}-${page}-${limit}-${
      brandsArray.join("-") || "all"
    }-${conditionsArray.join("-") || "all"}-${
      validSportTypes.join("-") || "all"
    }-${productTypeIds.join("-") || "all"}-${options.minPrice ?? "min"}-${
      options.maxPrice ?? "max"
    }-${options.search ?? "none"}-${options.sort ?? "default"}`;

    const products = await Queries.runPayloadFind<Product>({
      collection: CollectionName.products,
      tag: `category-${cacheKey}`,
      params: {
        draft: false,
        overrideAccess: false,
        page,
        limit,
        pagination: true,
        sort: options.sort || "-createdAt",
        depth: 1,
        where,
        select: {
          title: true,
          slug: true,
          image: true,
          priceInEGP: true,
          originalPriceInEGP: true,
          brand: true,
          conditionType: true,
          conditionGrade: true,
          sportTypes: true,
          productType: true,
          status: true,
        } as any,
      },
    });

    const imageIds = products.map((p) => Number(p.image)).filter(Boolean);
    if (imageIds.length) {
      const media = await Queries.runPayloadFind<Media>({
        collection: "media",
        tag: `media-${cacheKey}`,
        params: {
          depth: 0,
          limit: 0,
          pagination: false,
          where: { id: { in: imageIds } },
        },
      });

      const mediaById = new Map<number, Media>();
      for (const m of media) mediaById.set(Number(m.id), m);

      products.forEach((p, i) => {
        (products[i] as any).image =
          mediaById.get(Number(p.image)) ?? (p.image as any);
      });
    }

    const countResult = await Queries.runPayloadFind<{ id: number }>({
      collection: CollectionName.products,
      tag: `category-${cacheKey}-count`,
      params: {
        draft: false,
        overrideAccess: false,
        limit: 0,
        pagination: false,
        depth: 0,
        where,
        select: { id: true } as any,
      },
    });

    return { products, totalCount: countResult.length };
  }

  static async queryAllProducts(): Promise<Product[]> {
    const products = await Queries.runPayloadFind<Product>({
      collection: CollectionName.products,
      tag: AppConst.CACHE_TAG_BOOTSTRAP,
      params: {
        draft: false,
        overrideAccess: false,
        limit: 0,
        pagination: false,
        sort: "-updatedAt",
        depth: 0,
        where: {
          and: [
            { _status: { equals: "published" } },
            { status: { equals: "available" } },
          ],
        },
        select: {
          title: true,
          slug: true,
          image: true,
          categories: true,
          priceInEGP: true,
          originalPriceInEGP: true,
          brand: true,
          conditionType: true,
          conditionGrade: true,
          conditionNotes: true,
          glbModel: true,
          productType: true,
          sportTypes: true,
          status: true,
          inventory: true,
        } as any,
      },
    });

    const imageIds = Array.from(
      new Set(products.map((product) => Number(product.image)).filter(Boolean)),
    );

    if (!imageIds.length) {
      return products;
    }

    const media = await Queries.runPayloadFind<Media>({
      collection: "media",
      tag: AppConst.CACHE_TAG_BOOTSTRAP,
      params: {
        depth: 0,
        limit: 0,
        pagination: false,
        where: {
          id: { in: imageIds },
        },
      },
    });

    const mediaById = new Map<number, Media>();
    for (const mediaItem of media) {
      mediaById.set(Number(mediaItem.id), mediaItem);
    }

    return products.map((product) => ({
      ...product,
      image: mediaById.get(Number(product.image)) as Media,
    })) as Product[];
  }

  static async queryHomeProducts(limit = 10): Promise<{
    products: Product[];
    conditionTypes: { id: number; code: string }[];
    conditionGrades: { id: number; code: string }[];
  }> {
    const [conditionTypes, conditionGrades] = await Promise.all([
      Queries.runPayloadFind<{ id: number; code: string }>({
        collection: "condition-types",
        tag: "home-condition-types",
        params: {
          limit: 10,
          pagination: false,
          select: { id: true, code: true } as any,
        },
      }),
      Queries.runPayloadFind<{ id: number; code: string }>({
        collection: "condition-grades",
        tag: "home-condition-grades",
        params: {
          limit: 20,
          pagination: false,
          select: { id: true, code: true } as any,
        },
      }),
    ]);

    const rawProducts = await Queries.runPayloadFind<Product>({
      collection: CollectionName.products,
      tag: "home-products",
      params: {
        draft: false,
        overrideAccess: false,
        limit: 100,
        pagination: false,
        sort: "-updatedAt",
        depth: 0,
        where: {
          and: [
            { _status: { equals: "published" } },
            { status: { equals: "available" } },
            { inventory: { greater_than: 0 } },
          ],
        },
        select: {
          title: true,
          slug: true,
          image: true,
          brand: true,
          priceInEGP: true,
          originalPriceInEGP: true,
          conditionType: true,
          conditionGrade: true,
          inventory: true,
          updatedAt: true,
          sportTypes: true,
          productType: true,
          status: true,
        } as any,
      },
    });

    const imageIds = Array.from(
      new Set(rawProducts.map((p) => Number(p.image)).filter(Boolean)),
    );

    let products = rawProducts;

    if (imageIds.length) {
      const media = await Queries.runPayloadFind<Media>({
        collection: "media",
        tag: "home-products-media",
        params: {
          depth: 0,
          limit: 0,
          pagination: false,
          where: { id: { in: imageIds } },
        },
      });

      const mediaById = new Map<number, Media>();
      for (const m of media) mediaById.set(Number(m.id), m);

      products = rawProducts.map((p) => ({
        ...p,
        image: (mediaById.get(Number(p.image)) ?? p.image) as any,
      }));
    }

    return {
      products: products.slice(0, limit * 3),
      conditionTypes,
      conditionGrades,
    };
  }

  static async queryProductBySlug(
    slug: string,
  ): Promise<ProductSinglePage | null> {
    const product = await Queries.queryBySlug<Product>(
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
        specs: true,
        availableSizes: true,
      } as any,
    );

    if (!product) return null;

    const tag = `${CollectionName.products}-${slug}`;
    const { isEnabled: draft } = await draftMode();

    const relatedProductIds =
      (
        await Queries.runPayloadFind<{ relatedProducts?: number[] }>({
          collection: CollectionName.products,
          tag,
          cache: !draft,
          params: {
            depth: 0,
            draft,
            overrideAccess: draft,
            limit: 1,
            pagination: false,
            where: { id: { equals: product.id } },
            select: { relatedProducts: true },
          },
        })
      )[0]?.relatedProducts ?? [];

    let relatedProducts: Product[] = [];
    if (relatedProductIds.length) {
      const allProducts = await Queries.queryAllProducts();
      relatedProducts = allProducts.filter((relatedProduct) =>
        relatedProductIds.includes(relatedProduct.id),
      );
    }

    const combined = product.enableVariants
      ? await Queries.queryCombinedVariantData(product.id, tag)
      : null;

    return {
      id: product.id,
      title: product.title,
      description: product.description,
      updatedAt: product.updatedAt,
      gallery: product.gallery,
      faqs: product.faqs,
      categories: (product as any).categories ?? [],
      relatedProducts,
      reviews: product.reviews?.docs as Review[],
      purchase_section: buildProductPurchaseSectionData(product, combined),
      conditionType: (product as any).conditionType ?? null,
      conditionGrade: (product as any).conditionGrade ?? null,
      conditionNotes: (product as any).conditionNotes ?? null,
      glbModel: (product as any).glbModel ?? null,
      brand: (product as any).brand ?? null,
    } as ProductSinglePage;
  }

  static queryCategoryBySlug(slug: string): Promise<Category | null> {
    return Queries.queryBySlug<Category>(CollectionName.category, slug, 1, {
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
    return Queries.runPayloadFind<SitemapItem>({
      collection: collection as any,
      tag: AppConst.CACHE_TAG_SITEMAP,
      params: {
        draft: false,
        overrideAccess: false,
        limit: 0,
        pagination: false,
        sort: "-updatedAt",
        depth: 0,
        where: {
          _status: { equals: "published" },
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      },
    });
  }

  static async querySitemapData(): Promise<SitemapData> {
    const [products, categories] = await Promise.all([
      Queries.fetchSlugs(CollectionName.products),
      Queries.fetchSlugs(CollectionName.category),
    ]);
    return { products, categories };
  }

  static querySiteSettings(): Promise<SiteSetting> {
    return Queries.runPayloadGlobal<SiteSetting>({
      tag: "site-settings",
      params: {
        slug: "site-settings",
        depth: 2,
      },
    });
  }

  static queryCategoriesBasic(): Promise<Category[]> {
    return Queries.runPayloadFind<Category>({
      collection: CollectionName.category,
      tag: AppConst.CACHE_TAG_BOOTSTRAP,
      params: {
        depth: 0,
        limit: 0,
        pagination: false,
        sort: "position",
        where: {
          and: [
            { _status: { equals: "published" } },
            { parent: { exists: false } },
          ],
        },
        select: {
          title: true,
          slug: true,
          id: true,
          image: true,
        } as any,
      },
    });
  }

  static async queryChildCategories(parentId: number): Promise<Category[]> {
    return Queries.runPayloadFind<Category>({
      collection: CollectionName.category,
      tag: `child-categories-${parentId}`,
      params: {
        depth: 0,
        limit: 0,
        pagination: false,
        sort: "position",
        where: {
          and: [
            { _status: { equals: "published" } },
            { parent: { equals: parentId } },
          ],
        },
        select: {
          title: true,
          slug: true,
          id: true,
          image: true,
        } as any,
      },
    });
  }

  // ✅ أنواع المنتجات — مؤقتًا بـ "product-types" as any
  static async queryProductTypes(): Promise<ProductType[]> {
    const result = await Queries.runPayloadFind<any>({
      collection: "product-types" as any, // ✅ مؤقت — بعد generate:types هنشيل as any
      tag: AppConst.CACHE_TAG_PRODUCT_TYPES,
      params: {
        depth: 1,
        limit: 0,
        pagination: false,
        sort: "position",
        where: {
          isActive: { equals: true },
        },
      },
    });

    return result.map((pt: any) => ({
      id: pt.id,
      title: pt.title,
      slug: pt.slug,
      sportTypes: pt.sportTypes ?? [],
      icon: pt.icon ?? null,
      position: pt.position ?? 0,
      isActive: pt.isActive ?? true,
      updatedAt: pt.updatedAt,
      createdAt: pt.createdAt,
    }));
  }

  // ═══════════════════════════════════════════════════════════════
  // ✅ Phase 2 — Sport-based Queries
  // ═══════════════════════════════════════════════════════════════

  /**
   * Helper عام — يرجّع instance الـpayload (للاستخدام من ملفات خارجية)
   */
  static async getPayloadPublic() {
    return Queries.getPayload();
  }

  /**
   * يجيب منتجات حسب (sport + productType + filters) مع pagination
   */
  static async runSportProducts(
    _payload: any,
    options: {
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
    },
  ): Promise<{ products: Product[]; totalCount: number }> {
    const rawPage = Number(options.page);
    const page =
      Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

    const rawLimit = Number(options.limit);
    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0
        ? Math.min(Math.floor(rawLimit), 48)
        : 12;

    const conditionsArray = Queries.parseMultiValue(options.condition);
    const brandsArray = Queries.parseMultiValue(options.brand);

    const where = await Queries.buildProductWhere(null, {
      brands: brandsArray,
      conditions: conditionsArray,
      sportTypes: options.sportType ? [options.sportType] : [],
      productTypeIds: options.productTypeId ? [options.productTypeId] : [],
      minPrice: options.minPrice,
      maxPrice: options.maxPrice,
      search: options.search,
    });

    const cacheKey = `sport-${
      options.sportType ?? "all"
    }-type-${options.productTypeId ?? "all"}-${page}-${limit}-${
      brandsArray.join("-") || "all"
    }-${conditionsArray.join("-") || "all"}-${options.minPrice ?? "min"}-${
      options.maxPrice ?? "max"
    }-${options.search ?? "none"}-${options.sort ?? "default"}`;

    const products = await Queries.runPayloadFind<Product>({
      collection: CollectionName.products,
      tag: cacheKey,
      params: {
        draft: false,
        overrideAccess: false,
        page,
        limit,
        pagination: true,
        sort: options.sort || "-createdAt",
        depth: 1,
        where,
        select: {
          title: true,
          slug: true,
          image: true,
          priceInEGP: true,
          originalPriceInEGP: true,
          brand: true,
          conditionType: true,
          conditionGrade: true,
          sportTypes: true,
          productType: true,
          status: true,
        } as any,
      },
    });

    const imageIds = products.map((p) => Number(p.image)).filter(Boolean);
    if (imageIds.length) {
      const media = await Queries.runPayloadFind<Media>({
        collection: "media",
        tag: `${cacheKey}-media`,
        params: {
          depth: 0,
          limit: 0,
          pagination: false,
          where: { id: { in: imageIds } },
        },
      });

      const mediaById = new Map<number, Media>();
      for (const m of media) mediaById.set(Number(m.id), m);

      products.forEach((p, i) => {
        (products[i] as any).image =
          mediaById.get(Number(p.image)) ?? (p.image as any);
      });
    }

    const countResult = await Queries.runPayloadFind<{ id: number }>({
      collection: CollectionName.products,
      tag: `${cacheKey}-count`,
      params: {
        draft: false,
        overrideAccess: false,
        limit: 0,
        pagination: false,
        depth: 0,
        where,
        select: { id: true } as any,
      },
    });

    return { products, totalCount: countResult.length };
  }

  /**
   * يجيب Product Types مفلترة بالـsport
   */
  static async queryProductTypesBySport(
    sportType: SportType | null,
  ): Promise<ProductType[]> {
    const all = await Queries.queryProductTypes();

    if (!sportType) return all;

    return all.filter(
      (pt) =>
        pt.sportTypes?.includes(sportType) ||
        pt.sportTypes?.includes(SportType.GENERAL) ||
        !pt.sportTypes?.length,
    );
  }
}