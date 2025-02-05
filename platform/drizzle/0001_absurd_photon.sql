DO $$ BEGIN
 CREATE TYPE "public"."UserType" AS ENUM('user', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"password" varchar NOT NULL,
	"website" varchar,
	"country" varchar,
	"hidden" boolean DEFAULT false NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"captain_id" integer NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"team_id" integer,
	"verified" boolean DEFAULT false NOT NULL,
	"type" "UserType" DEFAULT 'user' NOT NULL,
	"website" varchar,
	"country" varchar,
	"language" varchar,
	"hidden" boolean DEFAULT false NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"created" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "kube-ctf_post";