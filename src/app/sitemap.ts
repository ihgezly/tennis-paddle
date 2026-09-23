import { MetadataRoute } from "next";

import appConfig from "@/lib/core/config";
import DAL from "@/lib/core/dal";
import { RoutePath } from "@/lib/core/types/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const { products, categories } = await DAL.querySitemapData();
    const productTypes = await DAL.queryProductTypes();

    const baseUrl = appConfig.BASE_URL;

    // Static sport routes
    const staticRoutes: MetadataRoute.Sitemap = [
      { url: `${baseUrl}/`, lastModified: products[0]?.updatedAt },
      { url: `${baseUrl}/padel`, lastModified: new Date() },
      { url: `${baseUrl}/tennis`, lastModified: new Date() },
      { url: `${baseUrl}/shoes`, lastModified: new Date() },
      { url: `${baseUrl}/categories`, lastModified: products[0]?.updatedAt },
    ];

    // Sport + product type
    const sportTypeRoutes: MetadataRoute.Sitemap = [
      ...productTypes.map((pt) => ({
        url: `${baseUrl}/padel/${encodeURIComponent(pt.slug)}`,
        lastModified: pt.updatedAt,
      })),
      ...productTypes.map((pt) => ({
        url: `${baseUrl}/tennis/${encodeURIComponent(pt.slug)}`,
        lastModified: pt.updatedAt,
      })),
    ];

    // Shoes by sport
    const shoesRoutes: MetadataRoute.Sitemap = [
      { url: `${baseUrl}/shoes/padel`, lastModified: new Date() },
      { url: `${baseUrl}/shoes/tennis`, lastModified: new Date() },
    ];

    // Category pages
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/${RoutePath.category}/${encodeURIComponent(category.slug)}`,
      lastModified: category.updatedAt,
    }));

    // Product pages
    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/${RoutePath.product}/${encodeURIComponent(product.slug)}`,
      lastModified: product.updatedAt,
    }));

    return [
      ...staticRoutes,
      ...sportTypeRoutes,
      ...shoesRoutes,
      ...categoryRoutes,
      ...productRoutes,
    ];
  } catch (error) {
    console.error("Sitemap generation failed:", error);
    return [];
  }
}