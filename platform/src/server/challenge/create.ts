"use server";

import { ResultAsync } from "neverthrow";
import { db } from "../db";
import { challenges, dynamicChallenges } from "../db/schema";
import type { ChallengeConfig } from "../db/types";

export async function createChallenge(challenge: ChallengeConfig) {
    const transactionPromise = db.transaction(async (tx) => {
        const challengeInsertResult: { id: number }[] = await tx
            .insert(challenges)
            .values({
                name: challenge.name,
                flag: challenge.flag,
                author: challenge.author,
                category: challenge.category,
                description: challenge.description,
                type: challenge.value.type,
                points: challenge.value.initialPoints,
                initialPoints: challenge.value.initialPoints,
                hidden: challenge.hidden,
                dynamicFlag: challenge.dynamicFlag,
                hints: challenge.hints,
                files: challenge.files,
                deployType: challenge.deploy?.type,
                deploy: challenge.deploy,
            })
            .returning({ id: challenges.id });

        if (challengeInsertResult.length === 0 || challengeInsertResult[0] === undefined) {
            tx.rollback();
            return;
        }

        const challengeId = challengeInsertResult[0].id;

        if (challenge.value.type === "Dynamic") {
            // @ts-ignore
            // TODO: why tsc complain about decayFunction not existing????
            const { minimum, decay, type } = challenge.value.decayFunction;
            await tx.insert(dynamicChallenges).values({
                id: challengeId,
                minimum,
                decay,
                type,
            });
        }

        console.log("Challenge inserted successfully with ID:", challengeId);
        return challengeId;
    });

    const resultAsync = ResultAsync.fromPromise(transactionPromise, (error) => {
        console.error("Error inserting challenge:", error);
    });

    return await resultAsync;
}
