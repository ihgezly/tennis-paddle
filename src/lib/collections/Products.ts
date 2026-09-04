import type { Product } from "@/lib/core/types/payload-types";
import type { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";
import type { Field } from "payload";

import {
  DESCRIPTION_FIELD,
  FAQS_FIELD,
  adminOnlyAccess,
  makeAdminPreview,
  patchPricesGroupField,
  mixedSlugField,
} from "@/lib/collections/base-fields";
import { normalizeFaqs, makeRevalidateHooks } from "@/lib/collections/hooks";
import { CollectionName, RoutePath, InspectionStatus } from "@/lib/core/types/types";

export const Products: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,

  access: {
    ...adminOnlyAccess,
    read: () => true,
  },

  admin: {
    ...defaultCollection?.admin,
    defaultColumns: ["title", "brand", "enableVariants", "_status", "variants.variants"],
    ...makeAdminPreview(RoutePath.product),
    useAsTitle: "title",
  },

  hooks: {
    ...makeRevalidateHooks(CollectionName.products),

    beforeValidate: [
      async ({ data, req }) => {
        if (!data) return data;

        const gallery = data.gallery as Product["gallery"] | undefined;
        if (gallery) {
          const filtered = gallery.filter(
            (item): item is NonNullable<Product["gallery"]>[number] =>
              Boolean(item) && item.image !== null,
          );
          data.gallery = filtered.length ? filtered : [{ image: null }];
          data.image = data.gallery[0].image;
        }

        // Condition validation
        if (data.conditionType) {
          const conditionTypeId =
            typeof data.conditionType === "object"
              ? data.conditionType?.id
              : data.conditionType;

          const conditionType = await req.payload.findByID({
            collection: CollectionName.conditionTypes,
            id: String(conditionTypeId),
          });

          if (conditionType?.requiresGrade) {
            if (!data.conditionGrade) {
              throw new Error(
                "Condition grade is required for this condition type (e.g. used products).",
              );
            }
            if (!data.conditionNotes || String(data.conditionNotes).trim().length < 5) {
              throw new Error(
                "Condition notes are required for used products (min 5 characters).",
              );
            }
          }
        }

        return normalizeFaqs(data);
      },
    ],
  },

  fields: [
    { name: "title", type: "text", required: true, localized: true },

    {
      name: "brand",
      type: "text",
      admin: { position: "sidebar" },
    },

    {
      name: "categories",
      type: "relationship",
      admin: { position: "sidebar", sortOptions: "title" },
      hasMany: true,
      relationTo: CollectionName.category,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { hidden: true },
    },

    mixedSlugField(),

    ...((defaultCollection.fields || []) as Field[])
      .filter((f) => (f as { name?: string }).name !== "layout")
      .map((f) => {
        const g = f as Field & { admin?: { description?: string } };
        if (
          g.type === "group" &&
          g.admin?.description ===
            "Prices for this product in different currencies."
        ) {
          return patchPricesGroupField(g);
        }
        return f;
      }),

    {
      name: "priceInEGP",
      type: "number",
      min: 0,
      admin: {
        description: "Product price in Egyptian Pounds (primary display price).",
      },
    },
    {
      name: "originalPriceInEGP",
      type: "number",
      min: 0,
      admin: {
        description:
          "Original price before discount (optional). Shown as a strikethrough price when set.",
      },
    },

    DESCRIPTION_FIELD,

    {
      name: "gallery",
      type: "array",
      minRows: 1,
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
    },

    {
      name: "relatedProducts",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      filterOptions: ({ id }) => ({
        id: id ? { not_in: [id] } : { exists: true },
      }),
    },
    FAQS_FIELD,
    {
      name: "reviews",
      type: "join",
      collection: "reviews",
      on: "product",
    },

    // Condition fields
    {
      name: "conditionType",
      type: "relationship",
      relationTo: CollectionName.conditionTypes,
      admin: {
        position: "sidebar",
        description: "New or used. Determines whether a grade + notes are required.",
      },
    },
    {
      name: "conditionGrade",
      type: "relationship",
      relationTo: CollectionName.conditionGrades,
      admin: { position: "sidebar" },
    },
    {
      name: "conditionNotes",
      type: "textarea",
      admin: {
        position: "sidebar",
        description: "Required for used products — describe wear, defects, etc.",
      },
    },
    {
      name: "inspectionStatus",
      type: "select",
      defaultValue: InspectionStatus.DRAFT,
      options: Object.values(InspectionStatus),
      admin: { position: "sidebar" },
    },

    // 3D Model
    {
      name: "glbModel",
      label: "3D Model (.glb)",
      type: "relationship",
      relationTo: CollectionName.media3d,
      admin: {
        position: "sidebar",
        description: "Optional. Only .glb files are accepted (max 20MB).",
      },
    },
  ],
});