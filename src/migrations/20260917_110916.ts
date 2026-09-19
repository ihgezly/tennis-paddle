import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sell_requests" ALTER COLUMN "category_id" DROP NOT NULL;
  ALTER TABLE "sell_requests" ALTER COLUMN "condition_type_id" DROP NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sell_requests" ALTER COLUMN "category_id" SET NOT NULL;
  ALTER TABLE "sell_requests" ALTER COLUMN "condition_type_id" SET NOT NULL;`)
}
