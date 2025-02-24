ALTER TABLE "cadweb_order_item" DROP CONSTRAINT "cadweb_order_item_order_id_cadweb_order_id_fk";
--> statement-breakpoint
ALTER TABLE "cadweb_order_item" DROP CONSTRAINT "cadweb_order_item_product_id_cadweb_product_id_fk";
--> statement-breakpoint
ALTER TABLE "cadweb_order_item" ALTER COLUMN "product_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "cadweb_order_item" ADD CONSTRAINT "cadweb_order_item_order_id_cadweb_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."cadweb_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cadweb_order_item" ADD CONSTRAINT "cadweb_order_item_product_id_cadweb_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."cadweb_product"("id") ON DELETE set null ON UPDATE no action;