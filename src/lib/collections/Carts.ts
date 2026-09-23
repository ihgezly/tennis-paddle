import type { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";

/**
 * إخفاء الـcarts من الـsidebar (بيستخدم داخلياً من الـplugin)
 */
export const Carts: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  admin: {
    ...(defaultCollection.admin ?? {}),
    group: "مخفي",
    hidden: true,
  },
});