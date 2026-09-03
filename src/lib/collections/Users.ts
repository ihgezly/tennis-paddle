import type { CollectionConfig } from "payload";
import { isAdmin } from "@/lib/collections/base-fields";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    hidden: true,
    useAsTitle: "email",
    group: "Internal",
    defaultColumns: ["email"],
  },
  auth: true,
  access: {
    // العميل يقرأ بياناته فقط، والأدمن يقرأ الجميع
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (isAdmin({ req: { user } as any })) return true;
      return { id: { equals: user.id } };
    },
    // السماح بالتسجيل العام (إنشاء حساب عميل)
    create: () => true,
    delete: () => false,
    // المستخدم يعدل بياناته فقط
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (isAdmin({ req: { user } as any })) return true;
      return { id: { equals: user.id } };
    },
    admin: isAdmin,
  },
  fields: [
    {
      name: "roles",
      type: "select",
      hasMany: true,
      defaultValue: ["customer"],
      options: [
        { label: "admin", value: "admin" },
        { label: "customer", value: "customer" },
      ],
      admin: { hidden: true },
    },
  ],
};