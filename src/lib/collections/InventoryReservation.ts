import type { CollectionConfig } from "payload";
import { isAdmin } from "@/lib/collections/base-fields";

export const InventoryReservation: CollectionConfig = {
  slug: "inventory-reservations",
  admin: {
    useAsTitle: "id",
    group: "Internal",
    defaultColumns: ["order", "status", "quantity", "expiresAt", "createdAt"],
  },
  access: {
    read: isAdmin,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "order", type: "relationship", relationTo: "orders", required: true },
    { name: "product", type: "relationship", relationTo: "products", required: true },
    { name: "variant", type: "relationship", relationTo: "variants" },
    { name: "quantity", type: "number", required: true, min: 1 },
    {
      name: "status",
      type: "select",
      required: true,
      options: ["active", "released", "converted", "expired"],
      defaultValue: "active",
    },
    { name: "expiresAt", type: "date", required: true },
    { name: "releasedAt", type: "date" },
    { name: "convertedAt", type: "date" },
  ],
};