import { sql } from "@payloadcms/db-postgres/drizzle";
import type { CollectionConfig, CollectionBeforeChangeHook } from "payload";

import { isAdmin } from "@/lib/collections/base-fields";

const ensureFirstUserIsAdmin: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== "create" || !data) return data;

  try {
    await req.payload.db.drizzle.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(918273645)`);

      const result = await tx.execute(
        sql`SELECT COUNT(*)::int AS c FROM users`,
      );
      const total = Number((result.rows?.[0] as { c: number })?.c ?? 0);

      if (total === 0) {
        data.roles = ["admin"];
      }
    });
  } catch (err) {
    console.error("ensureFirstUserIsAdmin failed:", err);
  }

  return data;
};

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
    group: "المستخدمين",
    defaultColumns: ["email", "name", "roles", "createdAt"],
  },
  auth: true,
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (isAdmin({ req: { user } as any })) return true;
      return { id: { equals: user.id } };
    },
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
    beforeChange: [ensureFirstUserIsAdmin],
  },
  fields: [
    {
      name: "name",
      type: "text",
      admin: { description: "اسم العميل الكامل" },
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
      admin: {
        description: "صلاحيات المستخدم. الأدمن يقدر يدخل /admin",
      },
      access: {
        create: ({ req: { user } }) =>
          Boolean(user && isAdmin({ req: { user } as any })),
        update: ({ req: { user } }) =>
          Boolean(user && isAdmin({ req: { user } as any })),
      },
    },
  ],
};