import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "category" ADD COLUMN "parent_id" integer;
  ALTER TABLE "_category_v" ADD COLUMN "version_parent_id" integer;
  ALTER TABLE "category" ADD CONSTRAINT "category_parent_id_category_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_category_v" ADD CONSTRAINT "_category_v_version_parent_id_category_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "category_parent_idx" ON "category" USING btree ("parent_id");
  CREATE INDEX "_category_v_version_version_parent_idx" ON "_category_v" USING btree ("version_parent_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "category" DROP CONSTRAINT "category_parent_id_category_id_fk";
  
  ALTER TABLE "_category_v" DROP CONSTRAINT "_category_v_version_parent_id_category_id_fk";
  
  DROP INDEX "category_parent_idx";
  DROP INDEX "_category_v_version_version_parent_idx";
  ALTER TABLE "category" DROP COLUMN "parent_id";
  ALTER TABLE "_category_v" DROP COLUMN "version_parent_id";`)
}