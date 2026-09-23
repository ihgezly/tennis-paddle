import type { CollectionConfig } from "payload";
import { adminOnlyAccess } from "@/lib/collections/base-fields";
import { ConditionGradeCode, CollectionName } from "@/lib/core/types/types";

export const ConditionGrade: CollectionConfig = {
  slug: CollectionName.conditionGrades,
  admin: {
    useAsTitle: "code",
    group: "الإعدادات",
    defaultColumns: ["code", "conditionType", "nameEn", "isActive", "sortOrder"],
  },
  access: {
    ...adminOnlyAccess,
    read: () => true,
  },
  fields: [
    {
      name: "conditionType",
      type: "relationship",
      relationTo: CollectionName.conditionTypes,
      required: true,
    },
    {
      name: "code",
      type: "select",
      required: true,
      options: Object.values(ConditionGradeCode),
    },
    { name: "nameEn", label: "Name (English)", type: "text", required: true },
    { name: "nameAr", label: "Name (Arabic)", type: "text", required: true },
    { name: "sortOrder", type: "number", defaultValue: 0, min: 0 },
    { name: "isActive", type: "checkbox", defaultValue: true },
  ],
};