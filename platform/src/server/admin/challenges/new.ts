"use server";

import { db } from "~/server/db";
import { challenges, challengesValue } from "~/server/db/schema";
import type { ChallengeConfig } from "~/server/db/types";

export async function AddChallenge(config: ChallengeConfig): Promise<void> {
    db.transaction(async (tx) => {
        const challenge = await tx
            .insert(challenges)
            .values({
                name: config.name,
                flag: config.flag,
                author: config.author,
                category: config.category,
                description: config.description,
                hints: config.hints,
                value: config.value.initialValue,
                files: config.files,
                dynamicFlag: config.dynamicFlag,
                hidden: config.hidden,
                deploy: config.deploy ?? {},
            })
            .returning({ id: challenges.id });

        console.log(challenge);

        if (config.value.type === "Static") {
            return;
        }

        const value = await tx.insert(challengesValue).values({
            id: challenge[0]?.id!,
            initial: config.value.initialValue,
            minimum: config.value.decayFunction?.minimumValue,
            decay: config.value.decayFunction?.decay,
            function: config.value.decayFunction?.type,
        });

        console.log(value);
    });
}
