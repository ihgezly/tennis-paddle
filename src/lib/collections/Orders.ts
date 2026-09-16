import { addDataAndFileToRequest } from "payload";

import type { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";
import type {
  CollectionAfterChangeHook,
  CollectionBeforeValidateHook,
} from "payload";

import {
  isAdmin,
  stripAdminFieldComponent,
} from "@/lib/collections/base-fields";
import appConfig from "@/lib/core/config";
import { logAudit } from "@/lib/core/audit";
import { OrderNotifier } from "@/lib/core/OrderNotifier";
import {
  CollectionName,
  OrderStatus,
  PaymentStatus,
} from "@/lib/core/types/types";
import { isValidOrderStatusTransition } from "@/lib/core/util";

export const Orders: CollectionOverride = ({ defaultCollection }) => {
  return {
    ...defaultCollection,

    admin: {
      ...(defaultCollection.admin || {}),
      useAsTitle: "name",
      defaultColumns: ["name", "phone", "email", "status", "paymentStatus", "createdAt"],
    },

    access: {
      read: ({ req: { user } }) => {
        if (!user) return false;
        if (isAdmin({ req: { user } as any })) return true;
        return { customer: { equals: user.id } };
      },
      create: ({ req: { user } }) => Boolean(user),
      update: isAdmin,
      delete: isAdmin,
      admin: isAdmin,
    },

    fields: [
      ...((defaultCollection.fields || []) as any[])
        .filter(
          (f) =>
            f?.type !== "tabs" &&
            (!f?.name || !["customerEmail", "transactions"].includes(f.name)),
        )
        .map((f) => {
          if (f?.name === "customer")
            return {
              ...f,
              required: true,
              admin: {
                ...(f.admin || {}),
                position: "sidebar",
                readOnly: true,
              },
            };

          if (f?.name === "status")
            return {
              ...f,
              defaultValue: OrderStatus.PENDING_PAYMENT,
              options: Object.values(OrderStatus),
              admin: {
                ...(f.admin || {}),
                position: "sidebar",
                readOnly: true,
              },
            };

          if (f.type !== "row" || !Array.isArray(f.fields)) return f;

          const amountField = f.fields[0];
          const fixedAmount = {
            ...amountField,
            admin: stripAdminFieldComponent(amountField.admin),
          };

          return { ...f, fields: [fixedAmount] };
        }),

      { name: "name", type: "text", required: true },
      { name: "phone", type: "text", required: true },
      { name: "email", type: "email", required: true },
      {
        name: "OrderView",
        type: "ui",
        admin: {
          position: "sidebar",
          components: {
            Field: "@/components/admin/order-view#OrderView",
          },
        },
      },

      {
        name: "items",
        type: "array",
        required: true,
        fields: [
          {
            name: "product",
            type: "relationship",
            relationTo: CollectionName.products,
            required: true,
          },
          { name: "title", type: "text", required: true },
          { name: "quantity", type: "number", required: true },
          { name: "unitPrice", type: "number", required: true },
          { name: "lineTotal", type: "number", required: true },
        ],
      },

      // Payment fields
      {
        name: "paymentStatus",
        type: "select",
        defaultValue: PaymentStatus.PENDING,
        options: Object.values(PaymentStatus),
        admin: { position: "sidebar", readOnly: true },
      },
      {
        name: "currencyCode",
        type: "select",
        defaultValue: "EGP",
        options: ["EGP"],
        admin: { position: "sidebar", readOnly: true },
      },
      {
        name: "merchantOrderId",
        type: "text",
        admin: { position: "sidebar", readOnly: true },
      },
      {
        name: "paymobOrderId",
        type: "text",
        admin: { position: "sidebar", readOnly: true },
      },
      {
        name: "paymobTransactionId",
        type: "text",
        admin: { position: "sidebar", readOnly: true },
      },
    ],

    endpoints: [
      ...(defaultCollection.endpoints || []),
      {
        path: "/:id/status",
        method: "post",
        handler: async (req) => {
          if (!isAdmin({ req })) {
            return Response.json({ message: "Forbidden" }, { status: 403 });
          }

          await addDataAndFileToRequest(req);
          const id = req.routeParams?.id;
          const nextStatus = req.data?.status;
          if (!id || typeof nextStatus !== "string") {
            return Response.json(
              { message: "status is required" },
              { status: 400 },
            );
          }

          const order = await req.payload.findByID({
            collection: "orders",
            id: String(id),
          });

          if (
            !isValidOrderStatusTransition(
              order.status as unknown as OrderStatus,
              nextStatus,
            )
          ) {
            return Response.json(
              { message: "Invalid status transition" },
              { status: 400 },
            );
          }

          const updated = await req.payload.update({
            collection: "orders",
            id: String(id),
            data: { status: nextStatus },
            req,
          });

          return Response.json(updated);
        },
      },
      // ✅ جديد — endpoint لتعديل سعر الطلب
      {
        path: "/:id/adjust-price",
        method: "post",
        handler: async (req) => {
          if (!isAdmin({ req })) {
            return Response.json({ message: "Forbidden" }, { status: 403 });
          }

          await addDataAndFileToRequest(req);
          const id = req.routeParams?.id;
          const incoming = req.data?.items;

          if (!id || !Array.isArray(incoming)) {
            return Response.json(
              { message: "items array required" },
              { status: 400 },
            );
          }

          const order = await req.payload.findByID({
            collection: "orders",
            id: String(id),
          });

          const newItems = order.items.map((originalItem: any) => {
            const patch = incoming.find(
              (i: any) =>
                i.id === originalItem.id ||
                Number(i.product) === Number(originalItem.product),
            );
            if (!patch) return originalItem;
            const unitPrice = Number(patch.unitPrice);
            if (!Number.isFinite(unitPrice) || unitPrice < 0) return originalItem;
            const lineTotal = unitPrice * Number(originalItem.quantity);
            return { ...originalItem, unitPrice, lineTotal };
          });

          const newTotal = newItems.reduce(
            (s: number, i: any) => s + Number(i.lineTotal),
            0,
          );

          const updated = await req.payload.update({
            collection: "orders",
            id: String(id),
            data: { items: newItems, amount: newTotal },
            req,
          });

          await logAudit(req, {
            action: "order.price_adjusted",
            entity: "orders",
            entityId: String(id),
            before: { items: order.items, amount: order.amount },
            after: { items: newItems, amount: newTotal },
          });

          return Response.json(updated);
        },
      },
    ],

    hooks: {
      ...(defaultCollection.hooks || {}),

      afterChange: [
        ...((defaultCollection.hooks?.afterChange ||
          []) as CollectionAfterChangeHook[]),

        async (args) => {
          const { operation, doc, req } = args;
          if (operation !== "create" || !appConfig.SEND_EMAIL_WHATSAPP)
            return doc;

          await new OrderNotifier(req.payload).send(doc);

          return doc;
        },
      ],

      beforeValidate: [
        ...((defaultCollection.hooks
          ?.beforeValidate as CollectionBeforeValidateHook[]) || []),

        async ({ data, operation }) => {
          if (!data) return data;

          if (operation === "create" && !data.status) {
            data.status = OrderStatus.PENDING_PAYMENT;
          }

          if (operation === "create" && !data.paymentStatus) {
            data.paymentStatus = PaymentStatus.PENDING;
          }

          if (operation === "create" && !data.currencyCode) {
            data.currencyCode = "EGP";
          }

          return data;
        },
      ],
    },
  };
};