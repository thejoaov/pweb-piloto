CREATE TYPE "public"."order_status" AS ENUM('new', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_methods" AS ENUM('cash', 'card', 'debit', 'pix', 'ticket');--> statement-breakpoint
CREATE TYPE "public"."user_roles" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "cadweb_order_item" (
	"id" uuid PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "cadweb_order" (
	"id" uuid PRIMARY KEY NOT NULL,
	"total" double precision NOT NULL,
	"status" "order_status" DEFAULT 'new' NOT NULL,
	"user_id" uuid,
	"modified_by_id" uuid,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "cadweb_payment" (
	"id" uuid PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"amount" double precision NOT NULL,
	"payment_date" timestamp NOT NULL,
	"payment_method" "payment_methods" NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "cadweb_product" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" double precision NOT NULL,
	"image_base64" text,
	"created_by" uuid NOT NULL,
	"stock_id" uuid NOT NULL,
	"modified_by_id" uuid,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "cadweb_stock" (
	"id" uuid PRIMARY KEY NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "cadweb_users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"image" text,
	"role" "user_roles" DEFAULT 'user' NOT NULL,
	"birth_date" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3),
	CONSTRAINT "cadweb_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "cadweb_order_item" ADD CONSTRAINT "cadweb_order_item_order_id_cadweb_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."cadweb_order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cadweb_order_item" ADD CONSTRAINT "cadweb_order_item_product_id_cadweb_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."cadweb_product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cadweb_order" ADD CONSTRAINT "cadweb_order_user_id_cadweb_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."cadweb_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cadweb_order" ADD CONSTRAINT "cadweb_order_modified_by_id_cadweb_users_id_fk" FOREIGN KEY ("modified_by_id") REFERENCES "public"."cadweb_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cadweb_payment" ADD CONSTRAINT "cadweb_payment_order_id_cadweb_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."cadweb_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cadweb_product" ADD CONSTRAINT "cadweb_product_created_by_cadweb_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."cadweb_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cadweb_product" ADD CONSTRAINT "cadweb_product_stock_id_cadweb_stock_id_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."cadweb_stock"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cadweb_product" ADD CONSTRAINT "cadweb_product_modified_by_id_cadweb_users_id_fk" FOREIGN KEY ("modified_by_id") REFERENCES "public"."cadweb_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cadweb_users" ADD CONSTRAINT "users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;