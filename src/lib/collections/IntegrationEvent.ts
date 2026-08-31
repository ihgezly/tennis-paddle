import type { CollectionConfig } from "payload";
import { isAdmin } from "@/lib/collections/base-fields";
import { CollectionName, IntegrationEventStatus } from "@/lib/core/types/types";

export const IntegrationEvent: CollectionConfig = {
  slug: CollectionName.integrationEvents,
  admin: {
    useAsTitle: "eventId",
    group: "Internal",
    defaultColumns: ["provider", "eventType", "status", "resourceId", "createdAt"],
  },
  access: {
    read: isAdmin,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "provider", type: "text", required: true },
    { name: "eventId", type: "text", required: true, unique: true },
    { name: "eventType", type: "text" },
    { name: "resourceId", type: "text" },
    { name: "payloadHash", type: "text" },
    {
      name: "status",
      type: "select",
      defaultValue: IntegrationEventStatus.RECEIVED,
      options: Object.values(IntegrationEventStatus),
    },
    { name: "processedAt", type: "date" },
    { name: "error", type: "text" },
  ],
};