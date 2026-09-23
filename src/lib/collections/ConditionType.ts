import type { CollectionConfig } from "payload";
import { adminOnlyAccess } from "@/lib/collections/base-fields";
import { ConditionTypeCode, CollectionName } from "@/lib/core/types/types";

export const ConditionType: CollectionConfig = {
  slug: CollectionName.conditionTypes,
  admin: {
    useAsTitle: "code",
    group: "الإعدادات",
    defaultColumns: ["code", "nameEn", "requiresGrade", "isActive", "sortOrder"],
  },
  access: {
    ...adminOnlyAccess,
    read: () => true,
  },
  fields: [
    {
      name: "code",
      type: "select",
      required: true,
      unique: true,
      options: Object.values(ConditionTypeCode),
    },
    { name: "nameEn", label: "Name (English)", type: "text", required: true },
    { name: "nameAr", label: "Name (Arabic)", type: "text", required: true },
    {
      name: "requiresGrade",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "If checked, condition grade and notes are required.",
      },
    },
    { name: "isActive", type: "checkbox", defaultValue: true },
    { name: "sortOrder", type: "number", defaultValue: 0, min: 0 },
  ],
};