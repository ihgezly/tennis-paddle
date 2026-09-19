import type { CollectionConfig, CollectionBeforeChangeHook } from "payload";

import { isAdmin } from "@/lib/collections/base-fields";

/**
 * أول مستخدم يتم إنشاؤه في النظام يبقى admin تلقائيًا.
 * باقي المستخدمين customer افتراضيًا.
 */
const ensureFirstUserIsAdmin: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== "create" || !data) return data;

  try {
    const count = await req.payload.count({
      collection: "users",
      overrideAccess: true,
    });

    if (count.totalDocs === 0) {
      data.roles = ["admin"];
    }
  } catch (err) {
    console.error("ensureFirstUserIsAdmin failed:", err);
  }

  return data;
};

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    // ✅ شيلنا hidden — عشان تقدر تدير المستخدمين من /admin
    useAsTitle: "email",
    group: "Internal",
    defaultColumns: ["email", "name", "roles", "createdAt"],
  },
  auth: true,
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (isAdmin({ req: { user } as any })) return true;
      return { id: { equals: user.id } };
    },
    // ✅ السماح بالتسجيل العام
    create: () => true,
    delete: isAdmin,
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (isAdmin({ req: { user } as any })) return true;
      return { id: { equals: user.id } };
    },
    admin: isAdmin,
  },
  hooks: {
    // ✅ أول مستخدم = admin تلقائي
    beforeChange: [ensureFirstUserIsAdmin],
  },
  fields: [
    // ✅ حقل الاسم — جديد
    {
      name: "name",
      type: "text",
      admin: {
        description: "اسم العميل الكامل",
      },
    },
    {
      name: "roles",
      type: "select",
      hasMany: true,
      defaultValue: ["customer"],
      options: [
        { label: "Admin", value: "admin" },
        { label: "Customer", value: "customer" },
      ],
      // ✅ شيلنا hidden — عشان تقدر تعدل الأدوار من /admin
      admin: {
        description: "صلاحيات المستخدم. الأدمن يقدر يدخل /admin",
      },
      // ⚠️ حماية أمنية: الأدمن بس اللي يقدر يعدل الأدوار
      // (العميل العادي يقدر يشوف دوره بس مش يعدله)
      access: {
        create: ({ req: { user } }) =>
          Boolean(user && isAdmin({ req: { user } as any })),
        update: ({ req: { user } }) =>
          Boolean(user && isAdmin({ req: { user } as any })),
        // read بدون قيد — عشان /api/users/me يرجع الـrole للفرونت
      },
    },
  ],
};