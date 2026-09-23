import type { Product } from "@/lib/core/types/payload-types";
import type { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";
import type { Field } from "payload";

import {
  DESCRIPTION_FIELD,
  FAQS_FIELD,
  adminOnlyAccess,
  isAdmin,
  makeAdminPreview,
  mixedSlugField,
  stripUSDFromFields,
} from "@/lib/collections/base-fields";
import { normalizeFaqs, makeRevalidateHooks } from "@/lib/collections/hooks";
import {
  CollectionName,
  RoutePath,
  InspectionStatus,
  ProductStatus,
  RacketShape,
  SportType,
} from "@/lib/core/types/types";

export const Products: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,

  access: {
    ...adminOnlyAccess,
    read: () => true,
  },

  admin: {
    ...defaultCollection?.admin,
    group: "الكتالوج",
    defaultColumns: [
      "title",
      "brand",
      "productType",
      "sportTypes",
      "priceInEGP",
      "inventory",
      "status",
    ],
    ...makeAdminPreview(RoutePath.product),
    useAsTitle: "title",
  },

  hooks: {
    ...makeRevalidateHooks(CollectionName.products),

    beforeValidate: [
      async ({ data, req }) => {
        if (!data) return data;

        // ─── معالجة الجاليري ───
        const gallery = data.gallery as Product["gallery"] | undefined;
        if (gallery) {
          const filtered = gallery.filter(
            (item): item is NonNullable<Product["gallery"]>[number] =>
              Boolean(item) && item.image !== null,
          );
          data.gallery = filtered.length ? filtered : [{ image: null }];
          data.image = data.gallery[0].image;
        }

        // ─── التحقق من الحالة (مستعمل) ───
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
                "يجب تحديد درجة الحالة للمنتجات المستعملة.",
              );
            }
            if (
              !data.conditionNotes ||
              String(data.conditionNotes).trim().length < 5
            ) {
              throw new Error(
                "يجب كتابة ملاحظات الحالة (٥ أحرف على الأقل) للمنتجات المستعملة.",
              );
            }
          }
        }

        // ─── اشتقاق الرياضات من نوع المنتج لو مش موجودة ───
        // ✅ الحل المؤقت — بعد generate:types هنشيل as any
        if (data.productType && (!data.sportTypes || !data.sportTypes.length)) {
          const productTypeId =
            typeof data.productType === "object"
              ? data.productType?.id
              : data.productType;

          try {
            const pt = (await req.payload.findByID({
              collection: "product-types" as any,
              id: String(productTypeId),
            })) as any;

            if (pt?.sportTypes?.length) {
              data.sportTypes = pt.sportTypes;
            }
          } catch {
            // تجاهل — الأدمن يقدر يحددها يدوي
          }
        }

        return normalizeFaqs(data);
      },
    ],
  },

  fields: [
    // ─── Basic ───
    { name: "title", type: "text", required: true, localized: true },

    {
      name: "brand",
      type: "text",
      admin: {
        position: "sidebar",
        description: "الماركة (Nike, Adidas, Wilson, Babolat...)",
      },
    },

    // ─── Product Type (من DB) ───
    {
      name: "productType",
      type: "relationship",
      relationTo: "product-types" as any, // ✅ مؤقت — بعد generate:types هنشيل as any
      admin: {
        position: "sidebar",
        description: "نوع المنتج (مضرب، كرة، حذاء...)",
      },
    },

    // ─── Sport Types ───
    {
      name: "sportTypes",
      type: "select",
      hasMany: true,
      options: [
        { label: "بادل", value: SportType.PADEL },
        { label: "تنس", value: SportType.TENNIS },
        { label: "عام (الاتنين)", value: SportType.GENERAL },
      ],
      admin: {
        position: "sidebar",
        description: "الرياضات اللي المنتج مناسب لها",
      },
    },

    // ─── Categories ───
    {
      name: "categories",
      type: "relationship",
      admin: { position: "sidebar", sortOptions: "title" },
      hasMany: true,
      relationTo: CollectionName.category,
    },

    // ─── Image (hidden — auto from gallery) ───
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { hidden: true },
    },

    mixedSlugField(),

    // ─── حذف كل حقول USD من الـplugin ───
    ...stripUSDFromFields(((defaultCollection.fields || []) as Field[]).filter(
      (f) => (f as { name?: string }).name !== "layout",
    )),

    // ─── الأسعار (EGP فقط) ───
    {
      name: "priceInEGP",
      type: "number",
      required: true,
      min: 0,
      admin: {
        description: "سعر المنتج بالجنيه المصري",
      },
    },
    {
      name: "originalPriceInEGP",
      type: "number",
      min: 0,
      admin: {
        description:
          "السعر قبل الخصم (اختياري). لو موجود، هيتعرض مشطوب.",
      },
    },
    {
      name: "costPriceEGP",
      type: "number",
      min: 0,
      admin: {
        position: "sidebar",
        description: "سعر التكلفة (للأدمن فقط) — لحساب الربح.",
      },
      access: {
        read: ({ req: { user } }) =>
          Boolean(user && isAdmin({ req: { user } as any })),
      },
    },

    // ─── المخزون والحالة ───
    {
      name: "inventory",
      type: "number",
      required: true,
      min: 0,
      defaultValue: 1,
      admin: {
        position: "sidebar",
        description: "الكمية المتاحة للبيع",
      },
    },
    // ✅ status — محدّث بـPENDING و DRAFT
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: ProductStatus.AVAILABLE,
      options: [
        { label: "متاح", value: ProductStatus.AVAILABLE },
        { label: "محجوز", value: ProductStatus.PENDING },
        { label: "تم البيع", value: ProductStatus.SOLD },
        { label: "مسودة", value: ProductStatus.DRAFT },
      ],
      admin: {
        position: "sidebar",
        description: "حالة المنتج في المتجر",
      },
    },

    // ─── الوصف ───
    DESCRIPTION_FIELD,

    // ─── معرض الصور ───
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

    // ─── المواصفات (اختيارية — تظهر للمضارب والشوزات) ───
    {
      name: "specs",
      type: "group",
      label: "المواصفات",
      admin: {
        description:
          "مواصفات اختيارية — للمضارب (وزن/أبعاد/شكل)، للشوزات (مقاسات)",
      },
      fields: [
        {
          name: "weight",
          type: "number",
          min: 0,
          admin: { description: "الوزن بالجرام (للمضارب)" },
        },
        {
          name: "balance",
          type: "text",
          admin: {
            description: "التوازن: Head Light / Head Heavy / Balanced",
          },
        },
        {
          name: "length",
          type: "number",
          min: 0,
          admin: { description: "الطول بالسنتيمتر" },
        },
        {
          name: "width",
          type: "number",
          min: 0,
          admin: { description: "العرض بالسنتيمتر" },
        },
        {
          name: "thickness",
          type: "number",
          min: 0,
          admin: { description: "السمك بالمليمتر (للمضارب)" },
        },
        {
          name: "headSize",
          type: "number",
          min: 0,
          admin: { description: "مقاس الرأس بالسنتيمتر المربع" },
        },
        {
          name: "shape",
          type: "select",
          options: [
            { label: "Round (دائري)", value: RacketShape.ROUND },
            { label: "Teardrop (قطرة)", value: RacketShape.TEARDROP },
            { label: "Diamond (ماسي)", value: RacketShape.DIAMOND },
          ],
          admin: { description: "شكل المضرب" },
        },
      ],
    },

    // ─── مقاسات الشوزات ───
    {
      name: "availableSizes",
      type: "array",
      label: "المقاسات المتاحة (للشوزات)",
      admin: {
        description:
          "المقاسات المتاحة للشوزات (مثال: 38، 40، 42). اتركه فاضي لغير الشوزات.",
      },
      fields: [
        {
          name: "size",
          type: "text",
          required: true,
          admin: { description: "المقاس (مثال: 40 أو 40.5)" },
        },
        {
          name: "inventory",
          type: "number",
          min: 0,
          defaultValue: 1,
          admin: { description: "الكمية المتاحة للمقاس ده" },
        },
      ],
    },

    // ─── علاقات ───
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

    // ─── الحالة (جديد / مستعمل) ───
    {
      name: "conditionType",
      type: "relationship",
      relationTo: CollectionName.conditionTypes,
      admin: {
        position: "sidebar",
        description: "جديد أو مستعمل",
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
        description: "تفاصيل الحالة للمستعمل",
      },
    },
    {
      name: "inspectionStatus",
      type: "select",
      defaultValue: InspectionStatus.DRAFT,
      options: Object.values(InspectionStatus),
      admin: { position: "sidebar" },
    },

    // ─── 3D Model ───
    {
      name: "glbModel",
      label: "3D Model (.glb)",
      type: "relationship",
      relationTo: CollectionName.media3d,
      admin: {
        position: "sidebar",
        description: "اختياري. ملف .glb بحجم أقصى 20MB",
      },
    },
  ],
});