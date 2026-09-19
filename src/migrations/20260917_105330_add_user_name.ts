import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ADD COLUMN "name" varchar;
  ALTER TABLE "sell_requests" ADD COLUMN "phone" varchar NOT NULL;
  ALTER TABLE "products" ADD COLUMN "cost_price_e_g_p" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_cost_price_e_g_p" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" DROP COLUMN "name";
  ALTER TABLE "sell_requests" DROP COLUMN "phone";
  ALTER TABLE "products" DROP COLUMN "cost_price_e_g_p";
  ALTER TABLE "_products_v" DROP COLUMN "version_cost_price_e_g_p";`)
}
