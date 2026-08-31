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
    // أي مستخدم مسجل دخول يقدر يشوف بياناته
    read: ({ req: { user } }) => Boolean(user),
    // السماح للعامة بإنشاء حساب (عميل) من الواجهة
    create: () => true,
    delete: () => false,
    update: ({ req: { user } }) => {
      if (!user) return false;
      // المستخدم يعدل بياناته فقط، والأدمن يعدل أي مستخدم
      return isAdmin({ req: { user } as any }) || { id: { equals: user.id } };
    },
    admin: isAdmin,
  },
  fields: [
    {
      name: "roles",
      type: "select",
      hasMany: true,
      // عند التسجيل من الواجهة، يجب أن يحصل العميل على دور customer تلقائياً
      defaultValue: ["customer"],
      options: [
        { label: "admin", value: "admin" },
        { label: "customer", value: "customer" },
      ],
      admin: {
        hidden: true,
      },
    },
  ],
};