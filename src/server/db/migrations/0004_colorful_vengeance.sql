ALTER TABLE "piloto_product" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "piloto_product" ADD COLUMN "last_updated_by" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "piloto_product" ADD CONSTRAINT "piloto_product_created_by_piloto_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."piloto_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "piloto_product" ADD CONSTRAINT "piloto_product_last_updated_by_piloto_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."piloto_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
