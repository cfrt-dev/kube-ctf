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
CREATE TABLE IF NOT EXISTS "dynamic_challenge" (
	"id" serial NOT NULL,
	"initial" integer NOT NULL,
	"minimum" integer NOT NULL,
	"decay" integer NOT NULL,
	"function" "ChallengeDecayFunction" NOT NULL,
	CONSTRAINT "dynamic_challenge_id_unique" UNIQUE("id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dynamic_challenge" ADD CONSTRAINT "dynamic_challenge_id_challenges_id_fk" FOREIGN KEY ("id") REFERENCES "public"."challenges"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
