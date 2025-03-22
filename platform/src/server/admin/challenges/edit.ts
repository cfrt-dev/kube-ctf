"use server";

import { eq } from "drizzle-orm";
import { ResultAsync } from "neverthrow";
import { db } from "~/server/db";
import { challenges, dynamicChallenges } from "~/server/db/schema";
import type { ChallengeConfig } from "~/server/db/types";

export async function EditChallenge(config: ChallengeConfig, id: string) {
    const txPromise = db.transaction(async (tx) => {
        const challengePromise = await tx
            .update(challenges)
            .set({
                name: config.name,
                flag: config.flag,
                author: config.author,
                category: config.category,
                description: config.description,
                hints: config.hints,
                files: config.files,
                dynamicFlag: config.dynamicFlag,
                hidden: config.hidden,
                deploy: config.deploy,
                deployType: config.deploy?.type ?? "Static",
            })
            .where(eq(challenges.id, +id));

        if (config.value.type === "Dynamic") {
            // @ts-ignore
            // TODO: why tsc complain about decayFunction not existing????
            const { minimum, decay, type } = config.value.decayFunction;
            await tx.insert(dynamicChallenges).values({
                id: +id,
                minimum,
                decay,
                type,
            });
        }

        return id;
    });

    const resultAsync = ResultAsync.fromPromise(txPromise, (error) => {
        console.error("Error inserting challenge:", error);
    });

    return await resultAsync;
}
