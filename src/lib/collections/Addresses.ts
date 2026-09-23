import type { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";

/**
 * إخفاء الـaddresses من الـsidebar
 */
export const Addresses: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  admin: {
    ...(defaultCollection.admin ?? {}),
    group: "مخفي",
    hidden: true,
  },
});