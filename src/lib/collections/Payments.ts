import type { CollectionConfig } from "payload";
import { isAdmin } from "@/lib/collections/base-fields";

export const Payments: CollectionConfig = {
  slug: "payments",
  admin: {
    useAsTitle: "providerTransactionId",
    group: "Internal",
    defaultColumns: ["order", "provider", "amount", "currency", "status", "createdAt"],
  },
  access: {
    read: isAdmin,
    create: () => false, // تتم عبر Service Layer فقط
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "order", type: "relationship", relationTo: "orders", required: true },
    { name: "provider", type: "text", required: true },
    { name: "providerOrderId", type: "text" },
    { name: "providerTransactionId", type: "text", unique: true },
    { name: "amount", type: "number", required: true },
    { name: "currency", type: "text", required: true },
    {
      name: "status",
      type: "select",
      required: true,
      options: ["pending", "initiating", "authorized", "paid", "failed", "cancelled", "expired"],
      defaultValue: "pending",
    },
    { name: "idempotencyKey", type: "text", unique: true },
    { name: "rawReference", type: "json" },
    { name: "paidAt", type: "date" },
    { name: "failedAt", type: "date" },
  ],
};