ALTER TABLE "piloto_product" RENAME COLUMN "last_updated_by" TO "modified_by_id";--> statement-breakpoint
ALTER TABLE "piloto_product" DROP CONSTRAINT "piloto_product_last_updated_by_piloto_users_id_fk";
--> statement-breakpoint
ALTER TABLE "piloto_order" ADD COLUMN "modified_by_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "piloto_order" ADD CONSTRAINT "piloto_order_modified_by_id_piloto_users_id_fk" FOREIGN KEY ("modified_by_id") REFERENCES "public"."piloto_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "piloto_product" ADD CONSTRAINT "piloto_product_modified_by_id_piloto_users_id_fk" FOREIGN KEY ("modified_by_id") REFERENCES "public"."piloto_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
