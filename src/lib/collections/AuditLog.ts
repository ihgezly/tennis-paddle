import type { CollectionConfig } from "payload";
import { isAdmin } from "@/lib/collections/base-fields";
import { CollectionName } from "@/lib/core/types/types";

export const AuditLog: CollectionConfig = {
  slug: CollectionName.auditLogs,
  admin: {
    useAsTitle: "action",
    group: "مخفي",
    hidden: true, // ✅ مخفي من الـsidebar
    defaultColumns: ["action", "entity", "entityId", "actor", "createdAt"],
  },
  access: {
    read: isAdmin,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "actor", type: "relationship", relationTo: "users" },
    { name: "actorEmail", type: "text" },
    { name: "action", type: "text", required: true },
    { name: "entity", type: "text", required: true },
    { name: "entityId", type: "text", required: true },
    { name: "before", type: "json" },
    { name: "after", type: "json" },
    { name: "requestId", type: "text" },
    { name: "ip", type: "text" },
  ],
};