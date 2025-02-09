DO $$ BEGIN
 CREATE TYPE "public"."ChallengeDecayFunction" AS ENUM('linear', 'logarithmic');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."ChallengeType" AS ENUM('static', 'dynamic');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."UserType" AS ENUM('user', 'admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar,
	"flag" varchar NOT NULL,
	"type" "ChallengeType" DEFAULT 'static' NOT NULL,
	"description" text,
	"hints" varchar[] DEFAULT '{}' NOT NULL,
	"dynamicFlag" boolean DEFAULT false NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"files" boolean[] DEFAULT '{}' NOT NULL,
	"deploy" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dynamic_challenges" (
	"id" serial NOT NULL,
	"initial" integer NOT NULL,
	"minimum" integer NOT NULL,
	"decay" integer NOT NULL,
	"function" "ChallengeDecayFunction" NOT NULL,
	CONSTRAINT "dynamic_challenges_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "running_challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"challenge_id" integer,
	"user_id" integer,
	"start_time" timestamp DEFAULT now(),
	"end_time" timestamp DEFAULT NOW() + INTERVAL '1 hour'
);
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
	"created" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "teams_captain_id_unique" UNIQUE("captain_id")
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
	"created" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_team_id_unique" UNIQUE("team_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dynamic_challenges" ADD CONSTRAINT "dynamic_challenges_id_challenges_id_fk" FOREIGN KEY ("id") REFERENCES "public"."challenges"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "running_challenges" ADD CONSTRAINT "running_challenges_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "running_challenges" ADD CONSTRAINT "running_challenges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teams" ADD CONSTRAINT "teams_captain_id_users_id_fk" FOREIGN KEY ("captain_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "running_challenges_challenge_id_user_id_unique" ON "running_challenges" USING btree ("challenge_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "email_idx" ON "users" USING btree ("email");