DROP INDEX "running_challenges_challenge_id_user_id_unique";--> statement-breakpoint
DROP INDEX "email_idx";--> statement-breakpoint
ALTER TABLE "challenges" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "author" varchar;--> statement-breakpoint
CREATE UNIQUE INDEX "running_challenges_challenge_id_user_id_index" ON "running_challenges" USING btree ("challenge_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_index" ON "users" USING btree ("email");