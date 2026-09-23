import { addDataAndFileToRequest } from "payload";
import type { CollectionConfig } from "payload";
import { isAdmin } from "@/lib/collections/base-fields";
import { restockInventory } from "@/lib/core/inventory";
import { logAudit } from "@/lib/core/audit";
import {
  CollectionName,
  ReturnStatus,
  isValidReturnStatusTransition,
} from "@/lib/core/types/types";

export const ReturnRequest: CollectionConfig = {
  slug: CollectionName.returnRequests,
  admin: {
    useAsTitle: "id",
    group: "الطلبات",
    defaultColumns: ["order", "status", "createdAt"],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (isAdmin({ req: { user } as never })) return true;
      return { customer: { equals: user.id } };
    },
    create: ({ req: { user } }) => Boolean(user),
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [
      ({ data, req, operation }) => {
        if (!data) return data;
        if (operation === "create") {
          data.status = ReturnStatus.REQUESTED;
          data.customer = req.user?.id;
        }
        return data;
      },
    ],
  },
  endpoints: [
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
          return Response.json({ message: "status is required" }, { status: 400 });
        }

        const returnRequest = await req.payload.findByID({
          collection: CollectionName.returnRequests,
          id: String(id),
          depth: 2,
        });

        if (
          !isValidReturnStatusTransition(
            returnRequest.status as ReturnStatus,
            nextStatus,
          )
        ) {
          return Response.json(
            { message: "Invalid status transition" },
            { status: 400 },
          );
        }

        const updated = await req.payload.update({
          collection: CollectionName.returnRequests,
          id: String(id),
          data: { status: nextStatus },
          req,
        });

        if (nextStatus === ReturnStatus.RESTOCKED) {
          const items = returnRequest.items.map((item: any) => ({
            product: item.product,
            variant: item.variant,
            quantity: item.quantity,
          }));
          await restockInventory(req.payload, items, Number(id));
        }

        await logAudit(req, {
          action: "return_request.status_change",
          entity: CollectionName.returnRequests,
          entityId: String(id),
          before: { status: returnRequest.status },
          after: { status: nextStatus },
        });

        return Response.json(updated);
      },
    },
  ],
  fields: [
    {
      name: "customer",
      type: "relationship",
      relationTo: "users",
      required: true,
      admin: { readOnly: true, position: "sidebar" },
    },
    { name: "order", type: "relationship", relationTo: "orders", required: true },
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
        { name: "quantity", type: "number", required: true, min: 1 },
      ],
    },
    { name: "reason", type: "textarea", required: true },
    {
      name: "status",
      type: "select",
      defaultValue: ReturnStatus.REQUESTED,
      options: Object.values(ReturnStatus),
      admin: { position: "sidebar", readOnly: true },
    },
    { name: "adminNotes", type: "textarea", admin: { position: "sidebar" } },
  ],
};