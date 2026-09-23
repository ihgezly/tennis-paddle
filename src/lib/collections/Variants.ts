import type { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";
import type { Field } from "payload";

import {
  adminOnlyAccess,
  stripUSDFromFields,
} from "@/lib/collections/base-fields";

export const Variants: CollectionOverride = ({ defaultCollection }) => {
  const fields: Field[] = stripUSDFromFields(
    (defaultCollection.fields ?? []) as Field[],
  );

  fields.push({
    name: "priceInEGP",
    type: "number",
    min: 0,
    admin: {
      description: "سعر الـvariant بالجنيه المصري",
    },
  });

  fields.push({
    name: "originalPriceInEGP",
    type: "number",
    min: 0,
    admin: {
      description: "السعر قبل الخصم (اختياري)",
    },
  });

  return {
    ...defaultCollection,
    access: {
      ...adminOnlyAccess,
      read: () => true,
    },
    admin: {
      ...(defaultCollection.admin ?? {}),
      group: "الكتالوج",
      defaultColumns: Array.from(
        new Set([
          ...(defaultCollection.admin?.defaultColumns ?? []),
          "priceInEGP",
          "inventory",
        ]),
      ),
    },
    fields,
  };
};