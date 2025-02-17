CREATE TABLE "cadweb_pix_transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cpf" varchar(11) NOT NULL,
	"amount" double precision NOT NULL,
	"transaction_id" varchar(255) NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3)
);
