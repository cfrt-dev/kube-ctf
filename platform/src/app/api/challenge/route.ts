import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { generateContainerLinks } from "~/server/challenge/create";

import { db } from "~/server/db";
import { challenges, runningChallenges } from "~/server/db/schema";
import { type Link } from "~/server/db/types";
import { parseJWT } from "~/server/utils";

export type ChallengeInfo = {
    isRunning: boolean;
    instanceName?: string;
    links?: Link[];
    startTime?: Date;
};

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const challenge_id = searchParams.get("id");
    if (challenge_id === null) {
        return new NextResponse("Query param `id` not found", {
            status: 400,
        });
    }
    const challengeId = parseInt(challenge_id, 10);

    const token = req.cookies.get("token")!;
    const { jwt } = await parseJWT(token.value);
    const userId = jwt?.payload.userId;

    const result = await db
        .select({
            challenge: challenges,
            runningChallenges: runningChallenges,
        })
        .from(challenges)
        .leftJoin(
            runningChallenges,
            and(
                eq(runningChallenges.challenge_id, challenges.id),
                eq(runningChallenges.user_id, userId!),
            ),
        )
        .where(eq(challenges.id, challengeId))
        .limit(1);

    const challenge = result[0]!.challenge;
    const runningChallenge = result[0]!.runningChallenges;
    const isRunning = runningChallenge !== null;

    let links: Link[] | undefined;
    let instanceName: string | undefined;
    let startTime: Date | undefined;

    if (isRunning) {
        links = generateContainerLinks(challenge.deploy, runningChallenge.id);
        instanceName = runningChallenge.id;
        startTime = runningChallenge.start_time;
    }

    const response = {
        instanceName,
        isRunning,
        links,
        startTime,
    };
    return NextResponse.json(response);
}
