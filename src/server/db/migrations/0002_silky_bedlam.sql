CREATE TYPE "public"."user_roles" AS ENUM('admin', 'user');--> statement-breakpoint
ALTER TABLE "piloto_users" ADD COLUMN "role" "user_roles" DEFAULT 'user' NOT NULL;