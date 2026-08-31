import type { PayloadRequest } from "payload";
import { CollectionName } from "@/lib/core/types/types";

type AuditInput = {
  action: string;
  entity: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  requestId?: string;
};

export async function logAudit(req: PayloadRequest, input: AuditInput) {
  try {
    const ip = req.headers?.get?.("x-forwarded-for") as string | null;
    await req.payload.create({
      collection: CollectionName.auditLogs,
      data: {
        actor: req.user?.id,
        actorEmail: req.user?.email,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        before: (input.before ?? null) as object,
        after: (input.after ?? null) as object,
        requestId: input.requestId,
        ip,
      },
      req,
      overrideAccess: true,
      depth: 0,
    });
  } catch (error) {
    console.error("AUDIT LOG FAILED", input.action, input.entity, input.entityId, error);
  }
}