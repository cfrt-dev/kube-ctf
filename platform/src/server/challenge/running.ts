import { eq } from "drizzle-orm";
import { db } from "../db";
import { runningChallenges } from "../db/schema";

export async function getRunningChallenges(userId: number) {
    return db
        .select()
        .from(runningChallenges)
        .where(eq(runningChallenges.user_id, userId));
}
