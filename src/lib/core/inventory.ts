import { sql } from "@payloadcms/db-postgres/drizzle";
import type { CartItem } from "@/lib/core/types/types";
import type { PayloadRequest } from "payload";

type LineTarget = { table: "products" | "variants"; id: number; quantity: number };

const cartItemToTarget = (item: CartItem): LineTarget | null => {
  const quantity = Number(item?.quantity ?? 0);
  if (!quantity) return null;
  const variantId = typeof item.variant === "object" ? item.variant?.id : item.variant;
  if (variantId) return { table: "variants", id: Number(variantId), quantity };
  const productId = typeof item.product === "object" ? item.product?.id : item.product;
  if (!productId) return null;
  return { table: "products", id: Number(productId), quantity };
};

export class InsufficientStockError extends Error {
  constructor(public readonly target: LineTarget) {
    super(`Insufficient stock for ${target.table} #${target.id}`);
  }
}

export async function decrementInventoryForItems(req: PayloadRequest, items: CartItem[]) {
  const targets = items.map(cartItemToTarget).filter(Boolean) as LineTarget[];
  if (!targets.length) return;
  const db = req.payload.db.drizzle;
  await db.transaction(async (tx) => {
    for (const target of targets) {
      const tableIdent = target.table === "products" ? sql`products` : sql`variants`;
      const result = await tx.execute(sql`
        UPDATE ${tableIdent}
        SET inventory = inventory - ${target.quantity}
        WHERE id = ${target.id} AND inventory >= ${target.quantity}
        RETURNING inventory
      `);
      const rowCount = (result as any).rowCount ?? (result as any).rows?.length ?? 0;
      if (rowCount === 0) throw new InsufficientStockError(target);
    }
  });
}

export async function restockOrderItems(req: PayloadRequest, returnRequest: { items?: unknown }) {
  const items = Array.isArray(returnRequest.items) ? returnRequest.items as Array<{product?: number | {id:number}; quantity?: number}> : [];
  if (!items.length) return;
  const db = req.payload.db.drizzle;
  await db.transaction(async (tx) => {
    for (const item of items) {
      const productId = typeof item.product === "object" ? item.product?.id : item.product;
      const quantity = Number(item.quantity ?? 0);
      if (!productId || !quantity) continue;
      await tx.execute(sql`
        UPDATE products SET inventory = inventory + ${quantity} WHERE id = ${Number(productId)}
      `);
    }
  });
}