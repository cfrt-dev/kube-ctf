import { ResultAsync } from "neverthrow";
import { db } from "../db";
import { challenges, dynamicChallenge } from "../db/schema";
import type { Challenge, ChallengeDeploy, Link } from "../db/types";

export async function createChallenge(challenge: Challenge) {
    const transactionPromise = db.transaction(async (tx) => {
        const challengeInsertResult: { id: number }[] = await tx
            .insert(challenges)
            .values({
                name: challenge.name,
                flag: "flag{test_flag}",
                category: challenge.category,
                type: challenge.value.type,
                value: challenge.value.initialValue,
                author: challenge.author,
                description: challenge.description,
                hints: [],
                dynamicFlag: challenge.value.type === "dynamic",
                hidden: false,
                files: [],
                deploy: challenge.deploy,
            })
            .returning({ id: challenges.id });

        const challengeId = challengeInsertResult[0]!.id;

        if (challenge.value.type === "dynamic") {
            const { minimumValue, decay, type } = challenge.value.decayFunction!;
            await tx.insert(dynamicChallenge).values({
                id: challengeId,
                initial: challenge.value.initialValue,
                minimum: minimumValue,
                decay: decay,
                function: type,
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

export function generateRandomString(length: number): string {
    const alpha = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const characters = alpha + numbers;

    let result = alpha.charAt(Math.floor(Math.random() * alpha.length));
    for (let i = 0; i < length - 1; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
}

export function generateContainerLinks(challenge: ChallengeDeploy, randomString: string): Link[] {
    const baseDomain = "tasks.cfrt.dev";
    const links: Link[] = [];

    for (const container of challenge.containers) {
        const containerName = container.name ?? "";

        if (!container.ports) {
            continue;
        }

        for (const port of container.ports) {
            const portDomain = port.domain ?? "";

            const parts = [portDomain, containerName, randomString];
            const link = parts.filter((part) => part !== "").join("-");
            const finalLink = `${link}.${baseDomain}`;

            links.push({
                url: finalLink,
                protocol: port.protocol,
            });
        }
    }
    return links;
}
