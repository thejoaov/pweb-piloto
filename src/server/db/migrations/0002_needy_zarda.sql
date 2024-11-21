ALTER TABLE "piloto_order_item" ADD COLUMN "created_at" text DEFAULT 'now()' NOT NULL;--> statement-breakpoint
ALTER TABLE "piloto_order_item" ADD COLUMN "updated_at" text DEFAULT 'now()' NOT NULL;--> statement-breakpoint
ALTER TABLE "piloto_order" ADD COLUMN "created_at" text DEFAULT 'now()' NOT NULL;--> statement-breakpoint
ALTER TABLE "piloto_order" ADD COLUMN "updated_at" text DEFAULT 'now()' NOT NULL;--> statement-breakpoint
ALTER TABLE "piloto_product" ADD COLUMN "created_at" text DEFAULT 'now()' NOT NULL;--> statement-breakpoint
ALTER TABLE "piloto_product" ADD COLUMN "updated_at" text DEFAULT 'now()' NOT NULL;--> statement-breakpoint
ALTER TABLE "piloto_users" ADD COLUMN "created_at" text DEFAULT 'now()' NOT NULL;--> statement-breakpoint
ALTER TABLE "piloto_users" ADD COLUMN "updated_at" text DEFAULT 'now()' NOT NULL;