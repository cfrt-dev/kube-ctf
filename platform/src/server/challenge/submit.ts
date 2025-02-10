"use server";

import { eq } from "drizzle-orm";
import { db } from "../db";
import { runningChallenges } from "../db/schema";
import { deleteInstance } from "./deploy";

export async function submitFlag(
    instanceId: string,
    userFlag: string,
): Promise<boolean> {
    const row = await db
        .select({ flag: runningChallenges.flag })
        .from(runningChallenges)
        .where(eq(runningChallenges.id, instanceId));

    if (row.length === 0) {
        throw new Error(`Instance with ID ${instanceId} not found`);
    }

    const flag = row[0]!.flag;
    const result = flag === userFlag;

    if (!result) {
        return result;
    }

    await db
        .delete(runningChallenges)
        .where(eq(runningChallenges.id, instanceId));

    await deleteInstance(instanceId);

    return result;
}
