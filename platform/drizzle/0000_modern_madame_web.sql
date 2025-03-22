CREATE TYPE "public"."ChallengeDecayFunction" AS ENUM('Linear', 'Logarithmic');--> statement-breakpoint
CREATE TYPE "public"."ChallengeType" AS ENUM('Static', 'Dynamic');--> statement-breakpoint
CREATE TYPE "public"."UserType" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"flag" varchar NOT NULL,
	"author" varchar NOT NULL,
	"category" varchar NOT NULL,
	"description" text NOT NULL,
	"type" "ChallengeType" NOT NULL,
	"points" integer NOT NULL,
	"initialPoints" integer NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"dynamicFlag" boolean DEFAULT false NOT NULL,
	"hints" varchar[] DEFAULT '{}' NOT NULL,
	"files" jsonb NOT NULL,
	"deploy" jsonb
);
--> statement-breakpoint
CREATE TABLE "dynamicChallenges" (
	"id" integer NOT NULL,
	"minimum" integer,
	"decay" integer,
	"type" "ChallengeDecayFunction",
	CONSTRAINT "dynamicChallenges_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "running_challenges" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"challenge_id" integer,
	"user_id" integer,
	"flag" varchar NOT NULL,
	"start_time" timestamp DEFAULT now() NOT NULL,
	"end_time" timestamp DEFAULT NOW() + INTERVAL '1 hour' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"team_id" integer,
	"challenge_id" integer,
	"type" boolean,
	"answer" varchar NOT NULL,
	"submited_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
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
CREATE TABLE "users" (
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
ALTER TABLE "dynamicChallenges" ADD CONSTRAINT "dynamicChallenges_id_challenges_id_fk" FOREIGN KEY ("id") REFERENCES "public"."challenges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "running_challenges" ADD CONSTRAINT "running_challenges_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "running_challenges" ADD CONSTRAINT "running_challenges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_captain_id_users_id_fk" FOREIGN KEY ("captain_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "running_challenges_challenge_id_user_id_index" ON "running_challenges" USING btree ("challenge_id","user_id");--> statement-breakpoint
CREATE INDEX "submissions_challenge_id_index" ON "submissions" USING btree ("challenge_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_index" ON "users" USING btree ("email");