import type { CollectionConfig } from "payload";

import {
  adminOnlyAccess,
  mixedSlugField,
} from "@/lib/collections/base-fields";
import { makeRevalidateHooks } from "@/lib/collections/hooks";
import { SportType } from "@/lib/core/types/types";

export const ProductType: CollectionConfig = {
  slug: "product-types",
  admin: {
    useAsTitle: "title",
    group: "الكتالوج",
    defaultColumns: ["title", "slug", "sportTypes", "position", "isActive"],
    description: "أنواع المنتجات — تُستخدم لتصنيف كل منتج",
  },
  access: {
    ...adminOnlyAccess,
    read: () => true,
  },
  hooks: {
    afterChange: makeRevalidateHooks("product-types" as any).afterChange,
    afterDelete: makeRevalidateHooks("product-types" as any).afterDelete,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
      admin: {
        description: "مثال: مضرب، كرة، حذاء، شنطة، جريب",
      },
    },
    {
      name: "sportTypes",
      type: "select",
      hasMany: true,
      options: [
        { label: "بادل", value: SportType.PADEL },
        { label: "تنس", value: SportType.TENNIS },
        { label: "عام (الاتنين)", value: SportType.GENERAL },
      ],
      defaultValue: [SportType.GENERAL],
      admin: {
        description: "الرياضات اللي النوع ده ينفع لها",
      },
    },
    mixedSlugField(),
    {
      name: "icon",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "أيقونة اختيارية للنوع (SVG أو PNG)",
      },
    },
    {
      name: "position",
      type: "number",
      defaultValue: 0,
      min: 0,
      admin: {
        position: "sidebar",
        description: "ترتيب العرض",
      },
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description: "لو متوقف، مش هيظهر في الفلاتر",
      },
    },
  ],
};