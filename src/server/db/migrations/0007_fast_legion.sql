ALTER TABLE "piloto_order" RENAME COLUMN "total" TO "price";--> statement-breakpoint
ALTER TABLE "piloto_order" ALTER COLUMN "price" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "piloto_order" ALTER COLUMN "status" SET DEFAULT 'pending';