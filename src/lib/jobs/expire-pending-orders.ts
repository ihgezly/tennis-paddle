import { getPayload } from "payload";
import configPromise from "@payload-config";
import { sql } from "@payloadcms/db-postgres/drizzle";
import { withPayloadTransaction } from "@/lib/core/db/transaction";
import { releaseInventory } from "@/lib/core/inventory";
import { PaymentStatus, OrderStatus } from "@/lib/core/types/types";

export async function expirePendingOrders() {
  const payload = await getPayload({ config: configPromise });

  const expiredReservations = await payload.db.drizzle.execute(sql`
    SELECT r.order_id
    FROM inventory_reservations r
    JOIN orders o ON o.id = r.order_id
    WHERE r.status = 'active'
      AND r.expires_at <= NOW()
      AND o.payment_status = ${PaymentStatus.PENDING}
    GROUP BY r.order_id
    LIMIT 100
  `);

  for (const row of expiredReservations.rows ?? []) {
    const orderId = Number(row.order_id);

    try {
      await withPayloadTransaction(
        payload as any,
        {} as any,
        async (txReq, tx) => {
          const orderUpdate = await tx.execute(sql`
            UPDATE orders
            SET payment_status = ${PaymentStatus.EXPIRED},
                status = ${OrderStatus.CANCELED}
            WHERE id = ${orderId}
              AND payment_status = ${PaymentStatus.PENDING}
            RETURNING id
          `);

          if (!orderUpdate.rows?.[0]) return;

          await releaseInventory(tx, orderId, "expired");
        },
      );
    } catch (error) {
      console.error(`EXPIRATION_FAILED order=${orderId}`, error);
    }
  }
}