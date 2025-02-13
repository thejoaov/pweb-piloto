ALTER TABLE "cadweb_users" ADD COLUMN "cpf" text;--> statement-breakpoint
ALTER TABLE "cadweb_users" ADD CONSTRAINT "cadweb_users_cpf_unique" UNIQUE("cpf");