import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { slugField } from "payload";

import type { User } from "@/payload-types";
import type { PayloadRequest, CollectionAdminOptions, Field } from "payload";

import { RoutePath } from "@/lib/core/types/types";
import { generatePreviewPath } from "@/lib/core/util";

type AdminConfig = {
  components?: Record<string, unknown>;
} & Record<string, unknown>;

// ─── Helpers ───
const pickString = (v: unknown): string => {
  if (typeof v === "string") return v;

  if (v && typeof v === "object") {
    const obj = v as Record<string, unknown>;

    const he = obj.he;
    if (typeof he === "string" && he.trim()) return he;

    const en = obj.en;
    if (typeof en === "string" && en.trim()) return en;

    for (const val of Object.values(obj)) {
      if (typeof val === "string" && val.trim()) return val;
    }
  }

  return "";
};

const slugifyMixed = (input: unknown) =>
  pickString(input)
    .trim()
    .toLowerCase()
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const mixedSlugField = () =>
  slugField({
    useAsSlug: "title",
    slugify: slugifyMixed,
  });

const lowerName = (f: Field) => {
  const name = (f as { name?: unknown }).name;
  return typeof name === "string" ? name.toLowerCase() : "";
};

// ═══════════════════════════════════════════════════════════════
// ✅ USD Removal — نشيل حقول USD من الـplugin-Ecommerce
// ═══════════════════════════════════════════════════════════════
const USD_FIELDS = [
  "priceInUSDEnabled",
  "priceInUSD",
  "originalPriceInUSD",
];

/**
 * يشيل حقول USD بشكل recursive من أي field tree.
 * بيرجع `null` لو الـfield نفسه اتشال (USD field أو row/group فاضي).
 */
export const stripUSD = (field: Field): Field | null => {
  const name = (field as { name?: string }).name;

  // حقول USD مباشرة → شيل
  if (name && USD_FIELDS.includes(name)) {
    return null;
  }

  // Row — نعالج sub-fields
  if (field.type === "row") {
    const subFields = ((field as { fields?: Field[] }).fields || []) as Field[];
    const filtered = subFields
      .map((f) => stripUSD(f))
      .filter((f): f is Field => f !== null);

    if (filtered.length === 0) return null;
    return { ...field, fields: filtered } as Field;
  }

  // Group — نعالج (لو بقى فاضي بعد الفلترة نشيله)
  if (field.type === "group") {
    const subFields = ((field as { fields?: Field[] }).fields || []) as Field[];
    const filtered = subFields
      .map((f) => stripUSD(f))
      .filter((f): f is Field => f !== null);

    if (filtered.length === 0) return null;
    return { ...field, fields: filtered } as Field;
  }

  // Array — نعالج
  if (field.type === "array") {
    const subFields = ((field as { fields?: Field[] }).fields || []) as Field[];
    const filtered = subFields
      .map((f) => stripUSD(f))
      .filter((f): f is Field => f !== null);

    return { ...field, fields: filtered } as Field;
  }

  // Collapsible — نعالج
  if (field.type === "collapsible") {
    const subFields = ((field as { fields?: Field[] }).fields || []) as Field[];
    const filtered = subFields
      .map((f) => stripUSD(f))
      .filter((f): f is Field => f !== null);

    if (filtered.length === 0) return null;
    return { ...field, fields: filtered } as Field;
  }

  return field;
};

/**
 * بيطبق stripUSD على array كامل من الحقول
 */
export const stripUSDFromFields = (fields: Field[]): Field[] => {
  return fields
    .map((f) => stripUSD(f))
    .filter((f): f is Field => f !== null);
};

// ─── Admin Preview ───
export function makeAdminPreview(
  collection: RoutePath,
): Pick<NonNullable<CollectionAdminOptions>, "livePreview" | "preview"> {
  return {
    livePreview: {
      url: ({ data }) =>
        generatePreviewPath({
          collection,
          slug: typeof data?.slug === "string" ? data.slug : "",
        }),
    },

    preview: (data) =>
      generatePreviewPath({
        collection,
        slug: typeof data?.slug === "string" ? data.slug : "",
      }),
  };
}

// ─── Access ───
const checkRole = (
  allRoles: User["roles"] = [],
  user?: User | null,
): boolean => {
  if (user && allRoles) {
    return allRoles.some((role) => {
      return user?.roles?.some((individualRole) => {
        return individualRole === role;
      });
    });
  }

  return false;
};

export const isAdmin = ({ req: { user } }: { req: PayloadRequest }) => {
  return user ? checkRole(["admin"], user) : false;
};

export const adminOnlyAccess = {
  read: isAdmin,
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
  admin: isAdmin,
};

// ─── Shared Fields ───
export const DESCRIPTION_FIELD: Field = {
  name: "description",
  type: "richText",
  editor: lexicalEditor({
    features: ({ rootFeatures }) => [
      ...rootFeatures,
      HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4"] }),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
      HorizontalRuleFeature(),
    ],
  }),
  label: false,
  required: true,
};

export const FAQS_FIELD: Field = {
  name: "faqs",
  label: "FAQs",
  type: "array",
  labels: {
    singular: "FAQ",
    plural: "FAQs",
  },
  fields: [
    {
      name: "question",
      label: "Question",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "answer",
      label: "Answer",
      type: "textarea",
      required: true,
      localized: true,
    },
  ],
};

// ─── Legacy helpers (للتوافق مع الكود القديم) ───
export const stripAdminFieldComponent = (
  admin?: AdminConfig,
): AdminConfig | undefined => {
  if (!admin?.components) return admin;

  const components = { ...admin.components };
  delete components["Field"];
  return { ...admin, components };
};

export const patchPriceRowFields = (fields: Field[]): Field[] => {
  return stripUSDFromFields(fields);
};

export const patchPricesGroupField = (group: Field): Field => {
  const stripped = stripUSD(group);
  return (stripped ?? group) as Field;
};