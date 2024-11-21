CREATE TABLE IF NOT EXISTS "auth"."users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "piloto_order_item" (
	"id" uuid PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "piloto_order" (
	"id" uuid PRIMARY KEY NOT NULL,
	"total" integer NOT NULL,
	"status" varchar(255),
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "piloto_product" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"price" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "piloto_users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"image" text,
	CONSTRAINT "piloto_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "piloto_order_item" ADD CONSTRAINT "piloto_order_item_order_id_piloto_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."piloto_order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "piloto_order_item" ADD CONSTRAINT "piloto_order_item_product_id_piloto_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."piloto_product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "piloto_order" ADD CONSTRAINT "piloto_order_user_id_piloto_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."piloto_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
