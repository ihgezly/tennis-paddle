import { addDataAndFileToRequest } from "payload";
import type { CollectionConfig } from "payload";
import { isAdmin } from "@/lib/collections/base-fields";
import { logAudit } from "@/lib/core/audit";
import {
  CollectionName,
  SellRequestStatus,
  isValidSellRequestStatusTransition,
} from "@/lib/core/types/types";

const MIN_IMAGES = 5;

export const SellRequest: CollectionConfig = {
  slug: CollectionName.sellRequests,
  admin: {
    useAsTitle: "title",
    group: "Sell Requests",
    defaultColumns: ["title", "customer", "askingPrice", "status", "createdAt"],
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
      async ({ data, req, operation }) => {
        if (!data) return data;

        if (operation === "create") {
          data.status = SellRequestStatus.PENDING;
          data.customer = req.user?.id;
        }

        const images = Array.isArray(data.images) ? data.images : [];
        if (operation === "create" && images.length < MIN_IMAGES) {
          throw new Error(`Please upload at least ${MIN_IMAGES} images.`);
        }

        if (data.conditionType) {
          const conditionTypeId =
            typeof data.conditionType === "object"
              ? data.conditionType?.id
              : data.conditionType;

          const conditionType = await req.payload.findByID({
            collection: CollectionName.conditionTypes,
            id: String(conditionTypeId),
          });

          if (conditionType?.requiresGrade && !data.conditionGrade) {
            throw new Error(
              "A condition grade is required for this condition type.",
            );
          }
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation === "update" && previousDoc?.status !== doc.status) {
          await logAudit(req, {
            action: "sell_request.status_change",
            entity: CollectionName.sellRequests,
            entityId: String(doc.id),
            before: { status: previousDoc?.status },
            after: { status: doc.status },
          });
        }
        return doc;
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

        const sellRequest = await req.payload.findByID({
          collection: CollectionName.sellRequests,
          id: String(id),
        });

        if (
          !isValidSellRequestStatusTransition(
            sellRequest.status as SellRequestStatus,
            nextStatus,
          )
        ) {
          return Response.json(
            { message: "Invalid status transition" },
            { status: 400 },
          );
        }

        const patch: Record<string, unknown> = { status: nextStatus };
        if (typeof req.data?.offeredPrice === "number") patch.offeredPrice = req.data.offeredPrice;
        if (typeof req.data?.acceptedPrice === "number") patch.acceptedPrice = req.data.acceptedPrice;
        if (typeof req.data?.adminNotes === "string") patch.adminNotes = req.data.adminNotes;

        const updated = await req.payload.update({
          collection: CollectionName.sellRequests,
          id: String(id),
          data: patch,
          req,
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
    { name: "title", type: "text", required: true },
    {
      name: "category",
      type: "relationship",
      relationTo: CollectionName.category,
      required: true,
    },
    { name: "brand", type: "text" },
    // ✅ جديد — رقم الهاتف للتواصل
    { name: "phone", type: "text", required: true },
    { name: "description", type: "textarea", required: true },
    {
      name: "conditionType",
      type: "relationship",
      relationTo: CollectionName.conditionTypes,
      required: true,
    },
    {
      name: "conditionGrade",
      type: "relationship",
      relationTo: CollectionName.conditionGrades,
    },
    {
      name: "askingPrice",
      type: "number",
      required: true,
      min: 0,
      admin: { description: "Set by the customer." },
    },
    {
      name: "offeredPrice",
      type: "number",
      min: 0,
      admin: { description: "Set by admin during review.", position: "sidebar" },
    },
    {
      name: "acceptedPrice",
      type: "number",
      min: 0,
      admin: { position: "sidebar" },
    },
    {
      name: "currencyCode",
      type: "select",
      defaultValue: "EGP",
      options: ["EGP"],
    },
    {
      name: "images",
      type: "array",
      minRows: MIN_IMAGES,
      required: true,
      admin: { description: `At least ${MIN_IMAGES} photos required.` },
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
      ],
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: SellRequestStatus.PENDING,
      options: Object.values(SellRequestStatus),
      admin: { position: "sidebar", readOnly: true },
    },
    {
      name: "adminNotes",
      type: "textarea",
      admin: { position: "sidebar" },
    },
    {
      name: "resultingProduct",
      type: "relationship",
      relationTo: CollectionName.products,
      admin: { position: "sidebar", readOnly: true },
    },
  ],
};