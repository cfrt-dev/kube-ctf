"use server";

import { and, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { generateContainerLinks } from "~/lib/utils";
import { db } from "~/server/db";
import { challenges, runningChallenges, submissions } from "~/server/db/schema";
import type { PublicChallengeInfo } from "~/server/db/types";
import { parseJWT } from "~/server/utils";

export async function getChallengeInfo(challengeId: number): Promise<PublicChallengeInfo | null> {
    const cookie = await cookies();
    const token = cookie.get("token")?.value ?? "";
    const jwt = await parseJWT(token);
    if (jwt.isErr()) return null;
    const userId = jwt.value.user_id;

    const result = await db
        .select({
            challenge: challenges,
            runningChallenge: runningChallenges,
            isSolved: sql<boolean>`${submissions.id} IS NOT NULL`,
        })
        .from(challenges)
        .leftJoin(
            runningChallenges,
            and(eq(runningChallenges.challenge_id, challenges.id), eq(runningChallenges.user_id, userId)),
        )
        .leftJoin(
            submissions,
            and(
                eq(submissions.challenge_id, challenges.id),
                eq(submissions.user_id, userId),
                eq(submissions.type, true),
            ),
        )
        .where(eq(challenges.id, challengeId))
        .limit(1);

    if (result.length === 0 || result[0] === undefined) return null;

    const { challenge, runningChallenge, isSolved } = result[0];
    const challengeInfo: PublicChallengeInfo = {
        id: challenge.id,
        name: challenge.name,
        description: challenge.description,
        category: challenge.category,
        author: challenge.author,
        value: {
            type: challenge.type,
            points: challenge.points,
        },
        hints: challenge.hints,
        files: challenge.files,
        links: null,
        startTime: undefined,
        instanceName: undefined,
        isSolved,
        deployType: challenge.deployType,
    };

    if (runningChallenge !== null) {
        challengeInfo.links = generateContainerLinks(challenge.deploy, runningChallenge.id);
        challengeInfo.instanceName = runningChallenge.id;
        challengeInfo.startTime = runningChallenge.start_time;
    }

    return challengeInfo;
}
