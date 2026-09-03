import { sql } from "@payloadcms/db-postgres/drizzle";

type Tx = {
  execute: (query: unknown) => Promise<{
    rows?: any[];
    rowCount?: number;
  }>;
};

export type InventoryTarget = {
  productId: number;
  variantId?: number;
  quantity: number;
};

export class InsufficientStockError extends Error {
  constructor(public readonly target: InventoryTarget) {
    super(
      `Insufficient stock for product ${target.productId}${
        target.variantId ? ` variant ${target.variantId}` : ""
      }`,
    );
    this.name = "InsufficientStockError";
  }
}

export class InvalidQuantityError extends Error {
  constructor(quantity: unknown) {
    super(`Invalid inventory quantity: ${String(quantity)}`);
    this.name = "InvalidQuantityError";
  }
}

export class InvalidVariantProductError extends Error {
  constructor(public readonly productId: number, public readonly variantId: number) {
    super(`Variant ${variantId} does not belong to product ${productId}`);
    this.name = "InvalidVariantProductError";
  }
}

function normalizeQuantity(value: unknown): number {
  const quantity = Number(value);

  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    throw new InvalidQuantityError(value);
  }

  return quantity;
}

export function resolveTargets(items: any[]): InventoryTarget[] {
  const grouped = new Map<string, InventoryTarget>();

  for (const item of items ?? []) {
    const quantity = normalizeQuantity(item?.quantity);

    const productId =
      typeof item?.product === "object"
        ? Number(item.product?.id)
        : Number(item?.product);

    const variantId =
      typeof item?.variant === "object"
        ? Number(item.variant?.id)
        : Number(item?.variant ?? 0);

    if (!Number.isSafeInteger(productId) || productId <= 0) {
      throw new Error("INVALID_PRODUCT_ID");
    }

    if (variantId && (!Number.isSafeInteger(variantId) || variantId <= 0)) {
      throw new Error("INVALID_VARIANT_ID");
    }

    const key = `${productId}:${variantId || 0}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.quantity += quantity;
    } else {
      grouped.set(key, {
        productId,
        variantId: variantId || undefined,
        quantity,
      });
    }
  }

  return [...grouped.values()];
}

async function validateVariantProduct(
  tx: Tx,
  productId: number,
  variantId: number,
): Promise<void> {
  const result = await tx.execute(sql`
    SELECT id
    FROM variants
    WHERE id = ${variantId}
      AND product_id = ${productId}
    FOR UPDATE
  `);

  if (!result.rows?.[0]) {
    throw new InvalidVariantProductError(productId, variantId);
  }
}

export async function reserveInventory(
  tx: Tx,
  items: any[],
  orderId: number,
  expiresAt: Date,
): Promise<void> {
  const targets = resolveTargets(items);

  if (!targets.length) {
    throw new Error("NO_INVENTORY_TARGETS");
  }

  for (const target of targets) {
    if (target.variantId) {
      await validateVariantProduct(tx, target.productId, target.variantId);
    }

    const table = target.variantId ? sql`variants` : sql`products`;
    const tableId = target.variantId ?? target.productId;

    const result = await tx.execute(sql`
      UPDATE ${table}
      SET inventory = inventory - ${target.quantity}
      WHERE id = ${tableId}
        AND inventory >= ${target.quantity}
      RETURNING id, inventory
    `);

    if (!result.rows?.[0]) {
      throw new InsufficientStockError(target);
    }

    await tx.execute(sql`
      INSERT INTO inventory_reservations (
        order_id,
        product_id,
        variant_id,
        quantity,
        status,
        expires_at,
        created_at
      )
      VALUES (
        ${orderId},
        ${target.productId},
        ${target.variantId ?? null},
        ${target.quantity},
        'active',
        ${expiresAt},
        NOW()
      )
    `);

    await tx.execute(sql`
      INSERT INTO inventory_movements (
        product_id,
        variant_id,
        type,
        quantity,
        reference_type,
        reference_id,
        reason,
        created_at
      )
      VALUES (
        ${target.productId},
        ${target.variantId ?? null},
        'reserve',
        ${target.quantity},
        'order',
        ${orderId},
        'checkout',
        NOW()
      )
    `);
  }
}

export async function releaseInventory(
  tx: Tx,
  orderId: number,
  reason: "payment_failed" | "expired" | "cancelled" | "admin",
): Promise<void> {
  const reservationsResult = await tx.execute(sql`
    SELECT id, product_id, variant_id, quantity
    FROM inventory_reservations
    WHERE order_id = ${orderId}
      AND status = 'active'
    FOR UPDATE
  `);

  const rows = reservationsResult.rows ?? [];

  for (const row of rows) {
    const reservationId = Number(row.id);
    const productId = Number(row.product_id);
    const variantId = row.variant_id ? Number(row.variant_id) : null;
    const quantity = normalizeQuantity(row.quantity);

    const table = variantId ? sql`variants` : sql`products`;
    const tableId = variantId || productId;

    const inventoryResult = await tx.execute(sql`
      UPDATE ${table}
      SET inventory = inventory + ${quantity}
      WHERE id = ${tableId}
      RETURNING id
    `);

    if (!inventoryResult.rows?.[0]) {
      throw new Error(`INVENTORY_ITEM_NOT_FOUND:${tableId}`);
    }

    const reservationUpdate = await tx.execute(sql`
      UPDATE inventory_reservations
      SET status = 'released', released_at = NOW()
      WHERE id = ${reservationId}
        AND status = 'active'
      RETURNING id
    `);

    if (!reservationUpdate.rows?.[0]) {
      throw new Error(`RESERVATION_RELEASE_RACE:${reservationId}`);
    }

    await tx.execute(sql`
      INSERT INTO inventory_movements (
        product_id,
        variant_id,
        type,
        quantity,
        reference_type,
        reference_id,
        reason,
        created_at
      )
      VALUES (
        ${productId},
        ${variantId ?? null},
        'release',
        ${quantity},
        'order',
        ${orderId},
        ${reason},
        NOW()
      )
    `);
  }
}

export async function convertReservationToSale(
  tx: Tx,
  orderId: number,
): Promise<void> {
  const reservationsResult = await tx.execute(sql`
    SELECT id, product_id, variant_id, quantity
    FROM inventory_reservations
    WHERE order_id = ${orderId}
      AND status = 'active'
    FOR UPDATE
  `);

  const rows = reservationsResult.rows ?? [];

  if (!rows.length) {
    throw new Error(`NO_ACTIVE_RESERVATION_FOR_ORDER:${orderId}`);
  }

  for (const row of rows) {
    const reservationId = Number(row.id);
    const productId = Number(row.product_id);
    const variantId = row.variant_id ? Number(row.variant_id) : null;
    const quantity = normalizeQuantity(row.quantity);

    const updateResult = await tx.execute(sql`
      UPDATE inventory_reservations
      SET status = 'converted', converted_at = NOW()
      WHERE id = ${reservationId}
        AND status = 'active'
      RETURNING id
    `);

    if (!updateResult.rows?.[0]) {
      throw new Error(`RESERVATION_CONVERSION_RACE:${reservationId}`);
    }

    await tx.execute(sql`
      INSERT INTO inventory_movements (
        product_id,
        variant_id,
        type,
        quantity,
        reference_type,
        reference_id,
        reason,
        created_at
      )
      VALUES (
        ${productId},
        ${variantId ?? null},
        'sale',
        ${quantity},
        'order',
        ${orderId},
        'payment_success',
        NOW()
      )
    `);
  }
}

export async function restockInventory(
  payload: any,
  items: Array<{
    product?: number | { id: number };
    variant?: number | { id: number };
    quantity: number;
  }>,
  returnRequestId: number,
): Promise<void> {
  const db = payload.db.drizzle;

  await db.transaction(async (tx: Tx) => {
    for (const item of items) {
      const productId =
        typeof item.product === "object"
          ? Number(item.product?.id)
          : Number(item.product);

      const variantId =
        typeof item.variant === "object"
          ? Number(item.variant?.id)
          : Number(item.variant || 0);

      const quantity = Number(item.quantity ?? 0);

      if (!Number.isSafeInteger(quantity) || quantity <= 0) {
        throw new Error("INVALID_RESTOCK_QUANTITY");
      }

      const table = variantId ? sql`variants` : sql`products`;
      const id = variantId || productId;

      if (!Number.isSafeInteger(id) || id <= 0) {
        throw new Error("INVALID_RESTOCK_ITEM_ID");
      }

      await tx.execute(sql`
        UPDATE ${table}
        SET inventory = inventory + ${quantity}
        WHERE id = ${id}
      `);

      await tx.execute(sql`
        INSERT INTO inventory_movements (
          product_id,
          variant_id,
          type,
          quantity,
          reference_type,
          reference_id,
          reason,
          created_at
        )
        VALUES (
          ${productId},
          ${variantId || null},
          'return',
          ${quantity},
          'return',
          ${returnRequestId},
          'return_request',
          NOW()
        )
      `);
    }
  });
}