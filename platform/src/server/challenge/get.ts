"use server";

import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { challenges, runningChallenges } from "~/server/db/schema";
import type { PublicChallengeInfo } from "~/server/db/types";
import { parseJWT } from "~/server/utils";
import { generateContainerLinks } from "./create";

export async function getChallengeInfo(challengeId: number): Promise<PublicChallengeInfo | null> {
    const cookie = await cookies();
    const token = cookie.get("token")?.value ?? "";
    const jwt = await parseJWT(token);
    if (jwt.isErr()) return null;
    const userId = jwt.value.id;

    const result = await db
        .select({
            challenge: challenges,
            runningChallenge: runningChallenges,
        })
        .from(challenges)
        .leftJoin(
            runningChallenges,
            and(eq(runningChallenges.challenge_id, challenges.id), eq(runningChallenges.user_id, userId)),
        )
        .where(eq(challenges.id, challengeId))
        .limit(1);

    if (result.length === 0 || result[0] === undefined) return null;

    const { challenge, runningChallenge } = result[0];
    const challengeInfo: PublicChallengeInfo = {
        id: challenge.id,
        name: challenge.name,
        description: challenge.description,
        category: challenge.category,
        author: challenge.author,
        currentValue: challenge.value,
        type: challenge.type,
        hints: challenge.hints,
        files: challenge.files,
        links: null,
        startTime: undefined,
        instanceName: undefined,
        isSolved: false,
    };

    if (runningChallenge !== null) {
        challengeInfo.links = generateContainerLinks(challenge.deploy, runningChallenge.id);
        challengeInfo.instanceName = runningChallenge.id;
        challengeInfo.startTime = runningChallenge.start_time;
    }

    return challengeInfo;
}
