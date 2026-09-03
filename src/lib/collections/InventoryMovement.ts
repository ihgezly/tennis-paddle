import type { CollectionConfig } from "payload";
import { isAdmin } from "@/lib/collections/base-fields";
import { CollectionName } from "@/lib/core/types/types";

export const InventoryMovement: CollectionConfig = {
  slug: CollectionName.inventoryMovements,
  admin: {
    useAsTitle: "type",
    group: "Internal",
    defaultColumns: ["product", "variant", "type", "quantity", "createdAt"],
  },
  access: {
    read: isAdmin,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "product", type: "relationship", relationTo: "products", required: true },
    { name: "variant", type: "relationship", relationTo: "variants" },
    {
      name: "type",
      type: "select",
      required: true,
      options: ["reserve", "release", "sale", "return", "adjustment"],
    },
    { name: "quantity", type: "number", required: true },
    { name: "referenceType", type: "text" },   // order, return, manual, etc.
    { name: "referenceId", type: "text" },
    { name: "createdAt", type: "date", required: true, defaultValue: () => new Date() },
    { name: "createdBy", type: "relationship", relationTo: "users" },
  ],
};