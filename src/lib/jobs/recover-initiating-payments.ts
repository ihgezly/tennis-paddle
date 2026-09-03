import { getPayload } from "payload";
import configPromise from "@payload-config";
import { sql } from "@payloadcms/db-postgres/drizzle";
import { withPayloadTransaction } from "@/lib/core/db/transaction";
import { releaseInventory } from "@/lib/core/inventory";
import { PaymentStatus, OrderStatus } from "@/lib/core/types/types";

export async function recoverInitiatingPayments() {
  const payload = await getPayload({ config: configPromise });

  const expiredPayments = await payload.db.drizzle.execute(sql`
    SELECT p.id, p.order_id, p.provider_order_id, p.status
    FROM payments p
    WHERE p.status = ${PaymentStatus.INITIATING}
      AND p.expires_at <= NOW()
    LIMIT 100
  `);

  for (const payment of expiredPayments.rows ?? []) {
    try {
      await withPayloadTransaction(
        payload as any,
        {} as any,
        async (txReq, tx) => {
          // حاول تحديث Payment من INITIATING إلى EXPIRED
          const paymentUpdate = await tx.execute(sql`
            UPDATE payments
            SET status = ${PaymentStatus.EXPIRED}
            WHERE id = ${payment.id} AND status = ${PaymentStatus.INITIATING}
            RETURNING id
          `);
          if (!paymentUpdate.rows?.[0]) return;

          // تحديث Order
          const orderUpdate = await tx.execute(sql`
            UPDATE orders
            SET payment_status = ${PaymentStatus.EXPIRED}, status = ${OrderStatus.CANCELED}
            WHERE id = ${payment.order_id} AND payment_status = ${PaymentStatus.INITIATING}
            RETURNING id
          `);
          if (!orderUpdate.rows?.[0]) throw new Error("ORDER_STATE_CHANGED");

          // Release
          await releaseInventory(tx, Number(payment.order_id), "expired");
        },
      );
    } catch (error) {
      console.error("RECOVERY FAILED", payment.id, error);
    }
  }
}