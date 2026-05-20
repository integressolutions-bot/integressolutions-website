CREATE TABLE "psid_registrations" (
	"id" serial PRIMARY KEY,
	"serial" text NOT NULL,
	"item_name" text NOT NULL,
	"owner_name" text NOT NULL,
	"owner_email" text NOT NULL,
	"owner_phone" text,
	"notes" text,
	"payment_status" text DEFAULT 'pending_payment' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
