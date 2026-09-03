import type { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";
import type { Field } from "payload";

import {
  adminOnlyAccess,
  patchPricesGroupField,
} from "@/lib/collections/base-fields";

export const Variants: CollectionOverride = ({ defaultCollection }) => {
  const fields = (defaultCollection.fields ?? []).map((f): Field => {
    if (f.type !== "group") return f;
    return patchPricesGroupField(f);
  });

  fields.push({
    name: "originalPriceInEGP",
    type: "number",
    min: 0,
    admin: {
      description:
        "Original price before discount (optional). Shown as a strikethrough price when set.",
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