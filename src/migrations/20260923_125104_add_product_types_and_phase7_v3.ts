import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_product_types_sport_types" AS ENUM('padel', 'tennis', 'general');
  CREATE TYPE "public"."enum_products_sport_types" AS ENUM('padel', 'tennis', 'general');
  CREATE TYPE "public"."enum_product_availability_status" AS ENUM('available', 'pending', 'sold', 'draft');
  CREATE TYPE "public"."enum_products_specs_shape" AS ENUM('round', 'teardrop', 'diamond');
  CREATE TYPE "public"."enum__products_v_version_sport_types" AS ENUM('padel', 'tennis', 'general');
  CREATE TYPE "public"."enum__products_v_version_specs_shape" AS ENUM('round', 'teardrop', 'diamond');
  CREATE TABLE "product_types_sport_types" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_product_types_sport_types",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "product_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"icon_id" integer,
  	"position" numeric DEFAULT 0,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_sport_types" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_products_sport_types",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products_available_sizes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" varchar,
  	"inventory" numeric DEFAULT 1
  );
  
  CREATE TABLE "_products_v_version_sport_types" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__products_v_version_sport_types",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_products_v_version_available_sizes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" varchar,
  	"inventory" numeric DEFAULT 1,
  	"_uuid" varchar
  );
  
  ALTER TABLE "products" ALTER COLUMN "inventory" SET DEFAULT 1;
  ALTER TABLE "_products_v" ALTER COLUMN "version_inventory" SET DEFAULT 1;
  ALTER TABLE "products" ADD COLUMN "product_type_id" integer;
  ALTER TABLE "products" ADD COLUMN "status" "enum_product_availability_status" DEFAULT 'available';
  ALTER TABLE "products" ADD COLUMN "specs_weight" numeric;
  ALTER TABLE "products" ADD COLUMN "specs_balance" varchar;
  ALTER TABLE "products" ADD COLUMN "specs_length" numeric;
  ALTER TABLE "products" ADD COLUMN "specs_width" numeric;
  ALTER TABLE "products" ADD COLUMN "specs_thickness" numeric;
  ALTER TABLE "products" ADD COLUMN "specs_head_size" numeric;
  ALTER TABLE "products" ADD COLUMN "specs_shape" "enum_products_specs_shape";
  ALTER TABLE "_products_v" ADD COLUMN "version_product_type_id" integer;
  ALTER TABLE "_products_v" ADD COLUMN "version_status" "enum_product_availability_status" DEFAULT 'available';
  ALTER TABLE "_products_v" ADD COLUMN "version_specs_weight" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_specs_balance" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_specs_length" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_specs_width" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_specs_thickness" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_specs_head_size" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_specs_shape" "enum__products_v_version_specs_shape";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "product_types_id" integer;
  ALTER TABLE "product_types_sport_types" ADD CONSTRAINT "product_types_sport_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "product_types" ADD CONSTRAINT "product_types_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_sport_types" ADD CONSTRAINT "products_sport_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_available_sizes" ADD CONSTRAINT "products_available_sizes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_sport_types" ADD CONSTRAINT "_products_v_version_sport_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_available_sizes" ADD CONSTRAINT "_products_v_version_available_sizes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "product_types_sport_types_order_idx" ON "product_types_sport_types" USING btree ("order");
  CREATE INDEX "product_types_sport_types_parent_idx" ON "product_types_sport_types" USING btree ("parent_id");
  CREATE UNIQUE INDEX "product_types_slug_idx" ON "product_types" USING btree ("slug");
  CREATE INDEX "product_types_icon_idx" ON "product_types" USING btree ("icon_id");
  CREATE INDEX "product_types_updated_at_idx" ON "product_types" USING btree ("updated_at");
  CREATE INDEX "product_types_created_at_idx" ON "product_types" USING btree ("created_at");
  CREATE INDEX "products_sport_types_order_idx" ON "products_sport_types" USING btree ("order");
  CREATE INDEX "products_sport_types_parent_idx" ON "products_sport_types" USING btree ("parent_id");
  CREATE INDEX "products_available_sizes_order_idx" ON "products_available_sizes" USING btree ("_order");
  CREATE INDEX "products_available_sizes_parent_id_idx" ON "products_available_sizes" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_sport_types_order_idx" ON "_products_v_version_sport_types" USING btree ("order");
  CREATE INDEX "_products_v_version_sport_types_parent_idx" ON "_products_v_version_sport_types" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_available_sizes_order_idx" ON "_products_v_version_available_sizes" USING btree ("_order");
  CREATE INDEX "_products_v_version_available_sizes_parent_id_idx" ON "_products_v_version_available_sizes" USING btree ("_parent_id");
  ALTER TABLE "products" ADD CONSTRAINT "products_product_type_id_product_types_id_fk" FOREIGN KEY ("product_type_id") REFERENCES "public"."product_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_product_type_id_product_types_id_fk" FOREIGN KEY ("version_product_type_id") REFERENCES "public"."product_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_product_types_fk" FOREIGN KEY ("product_types_id") REFERENCES "public"."product_types"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_product_type_idx" ON "products" USING btree ("product_type_id");
  CREATE INDEX "_products_v_version_version_product_type_idx" ON "_products_v" USING btree ("version_product_type_id");
  CREATE INDEX "payload_locked_documents_rels_product_types_id_idx" ON "payload_locked_documents_rels" USING btree ("product_types_id");
  ALTER TABLE "variants" DROP COLUMN "price_in_u_s_d_enabled";
  ALTER TABLE "variants" DROP COLUMN "price_in_u_s_d";
  ALTER TABLE "_variants_v" DROP COLUMN "version_price_in_u_s_d_enabled";
  ALTER TABLE "_variants_v" DROP COLUMN "version_price_in_u_s_d";
  ALTER TABLE "products" DROP COLUMN "price_in_u_s_d_enabled";
  ALTER TABLE "products" DROP COLUMN "price_in_u_s_d";
  ALTER TABLE "_products_v" DROP COLUMN "version_price_in_u_s_d_enabled";
  ALTER TABLE "_products_v" DROP COLUMN "version_price_in_u_s_d";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "product_types_sport_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "product_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_sport_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_available_sizes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_sport_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_available_sizes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "product_types_sport_types" CASCADE;
  DROP TABLE "product_types" CASCADE;
  DROP TABLE "products_sport_types" CASCADE;
  DROP TABLE "products_available_sizes" CASCADE;
  DROP TABLE "_products_v_version_sport_types" CASCADE;
  DROP TABLE "_products_v_version_available_sizes" CASCADE;
  ALTER TABLE "products" DROP CONSTRAINT "products_product_type_id_product_types_id_fk";
  
  ALTER TABLE "_products_v" DROP CONSTRAINT "_products_v_version_product_type_id_product_types_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_product_types_fk";
  
  DROP INDEX "products_product_type_idx";
  DROP INDEX "_products_v_version_version_product_type_idx";
  DROP INDEX "payload_locked_documents_rels_product_types_id_idx";
  ALTER TABLE "products" ALTER COLUMN "inventory" SET DEFAULT 0;
  ALTER TABLE "_products_v" ALTER COLUMN "version_inventory" SET DEFAULT 0;
  ALTER TABLE "variants" ADD COLUMN "price_in_u_s_d_enabled" boolean DEFAULT true;
  ALTER TABLE "variants" ADD COLUMN "price_in_u_s_d" numeric;
  ALTER TABLE "_variants_v" ADD COLUMN "version_price_in_u_s_d_enabled" boolean DEFAULT true;
  ALTER TABLE "_variants_v" ADD COLUMN "version_price_in_u_s_d" numeric;
  ALTER TABLE "products" ADD COLUMN "price_in_u_s_d_enabled" boolean DEFAULT true;
  ALTER TABLE "products" ADD COLUMN "price_in_u_s_d" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_price_in_u_s_d_enabled" boolean DEFAULT true;
  ALTER TABLE "_products_v" ADD COLUMN "version_price_in_u_s_d" numeric;
  ALTER TABLE "products" DROP COLUMN "product_type_id";
  ALTER TABLE "products" DROP COLUMN "status";
  ALTER TABLE "products" DROP COLUMN "specs_weight";
  ALTER TABLE "products" DROP COLUMN "specs_balance";
  ALTER TABLE "products" DROP COLUMN "specs_length";
  ALTER TABLE "products" DROP COLUMN "specs_width";
  ALTER TABLE "products" DROP COLUMN "specs_thickness";
  ALTER TABLE "products" DROP COLUMN "specs_head_size";
  ALTER TABLE "products" DROP COLUMN "specs_shape";
  ALTER TABLE "_products_v" DROP COLUMN "version_product_type_id";
  ALTER TABLE "_products_v" DROP COLUMN "version_status";
  ALTER TABLE "_products_v" DROP COLUMN "version_specs_weight";
  ALTER TABLE "_products_v" DROP COLUMN "version_specs_balance";
  ALTER TABLE "_products_v" DROP COLUMN "version_specs_length";
  ALTER TABLE "_products_v" DROP COLUMN "version_specs_width";
  ALTER TABLE "_products_v" DROP COLUMN "version_specs_thickness";
  ALTER TABLE "_products_v" DROP COLUMN "version_specs_head_size";
  ALTER TABLE "_products_v" DROP COLUMN "version_specs_shape";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "product_types_id";
  DROP TYPE "public"."enum_product_types_sport_types";
  DROP TYPE "public"."enum_products_sport_types";
  DROP TYPE "public"."enum_product_availability_status";
  DROP TYPE "public"."enum_products_specs_shape";
  DROP TYPE "public"."enum__products_v_version_sport_types";
  DROP TYPE "public"."enum__products_v_version_specs_shape";`)
}
