CREATE TYPE "public"."order_status" AS ENUM('new', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_methods" AS ENUM('cash', 'card', 'debit', 'pix', 'ticket');--> statement-breakpoint
CREATE TABLE "piloto_order_item" (
	"id" uuid PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "piloto_order" (
	"id" uuid PRIMARY KEY NOT NULL,
	"total" double precision NOT NULL,
	"status" "order_status" DEFAULT 'new' NOT NULL,
	"user_id" uuid,
	"modified_by_id" uuid,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "piloto_payment" (
	"id" uuid PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"amount" double precision NOT NULL,
	"payment_date" timestamp NOT NULL,
	"payment_method" "payment_methods" NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "piloto_product" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" double precision NOT NULL,
	"image_base64" text,
	"created_by" uuid NOT NULL,
	"modified_by_id" uuid,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "piloto_stock" (
	"id" uuid PRIMARY KEY NOT NULL,
	"quantity" integer NOT NULL,
	"product_id" uuid NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "piloto_users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"image" text,
	"birth_date" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3),
	CONSTRAINT "piloto_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "piloto_order_item" ADD CONSTRAINT "piloto_order_item_order_id_piloto_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."piloto_order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "piloto_order_item" ADD CONSTRAINT "piloto_order_item_product_id_piloto_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."piloto_product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "piloto_order" ADD CONSTRAINT "piloto_order_user_id_piloto_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."piloto_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "piloto_order" ADD CONSTRAINT "piloto_order_modified_by_id_piloto_users_id_fk" FOREIGN KEY ("modified_by_id") REFERENCES "public"."piloto_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "piloto_payment" ADD CONSTRAINT "piloto_payment_order_id_piloto_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."piloto_order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "piloto_product" ADD CONSTRAINT "piloto_product_created_by_piloto_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."piloto_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "piloto_product" ADD CONSTRAINT "piloto_product_modified_by_id_piloto_users_id_fk" FOREIGN KEY ("modified_by_id") REFERENCES "public"."piloto_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "piloto_stock" ADD CONSTRAINT "piloto_stock_product_id_piloto_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."piloto_product"("id") ON DELETE no action ON UPDATE no action;