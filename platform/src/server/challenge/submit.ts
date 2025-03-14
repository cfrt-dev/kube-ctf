"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "../db";
import { runningChallenges, submissions } from "../db/schema";
import { parseJWT } from "../utils";
import { deleteInstance } from "./deploy";

export async function submitFlag(challenge_id: number, instanceId: string, userFlag: string): Promise<boolean> {
    const cookie = await cookies();
    const token = cookie.get("token")?.value ?? "";
    const jwt = await parseJWT(token);
    if (jwt.isErr()) return false;

    const { user_id, team_id } = jwt.value;

    const row = await db
        .select({ flag: runningChallenges.flag })
        .from(runningChallenges)
        .where(eq(runningChallenges.id, instanceId));

    if (row.length === 0) {
        throw new Error(`Instance with ID ${instanceId} not found`);
    }

    const flag = row[0]!.flag;
    const result = flag === userFlag;

    await db.insert(submissions).values({
        user_id,
        team_id,
        challenge_id,
        answer: userFlag,
        type: result,
    });

    if (!result) {
        return result;
    }

    const runningChallengesDeletion = db.delete(runningChallenges).where(eq(runningChallenges.id, instanceId));
    const instanceDeletion = deleteInstance(instanceId);

    await Promise.all([runningChallengesDeletion, instanceDeletion]);

    return result;
}
