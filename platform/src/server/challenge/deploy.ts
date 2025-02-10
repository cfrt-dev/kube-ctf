"use server";

import type { ChallengeDeploy, ChallengeDeployValues } from "~/server/db/types";
import { db } from "../db";
import { challenges, runningChallenges } from "../db/schema";
import { eq } from "drizzle-orm";
import { generateContainerLinks, generateRandomString } from "./create";

function getChallengeDeployValues(
    challenge: ChallengeDeploy,
): ChallengeDeployValues {
    const containerNames = new Set<string | null>();

    for (const container of challenge.containers) {
        const containerName = container.name ?? null;

        if (containerNames.has(containerName)) {
            throw new Error(
                `Duplicate container name: ${containerName ?? "unnamed"}`,
            );
        }
        containerNames.add(containerName);

        const portDomains = new Set<string | null>();

        if (container.ports) {
            for (const port of container.ports) {
                const portDomain = port.domain ?? null;

                if (portDomains.has(portDomain)) {
                    throw new Error(
                        `Duplicate port domain: ${portDomain ?? "no domain"}`,
                    );
                }
                portDomains.add(portDomain);
            }
        }
    }

    return {
        global: {
            baseDomain: "tasks.cfrt.dev",
            tlsCert: "wildcard-cert",
        },
        labels: {},
        imagePullSecrets: [],
        containers: challenge.containers,
    };
}

export async function createInstance(challenge_id: number) {
    const row = await db
        .select()
        .from(challenges)
        .where(eq(challenges.id, challenge_id))
        .limit(1);

    if (row.length === 0) {
        throw new Error(`Challenge with ID ${challenge_id} not found`);
    }

    const challenge = row[0]!;
    const name = generateRandomString(8);

    let runningChallenge;
    try {
        runningChallenge = (
            await db
                .insert(runningChallenges)
                .values({
                    id: name,
                    challenge_id: challenge_id,
                    user_id: 1,
                    flag: challenge.flag,
                })
                .returning({
                    id: runningChallenges.id,
                    start_time: runningChallenges.start_time,
                })
        )[0]!;
    } catch (error) {
        console.log(error);
        return;
    }

    await fetch(
        `https://challenge-manager.cfrt.dev/api/challenge?name=${name}`,
        {
            method: "POST",
            body: JSON.stringify(getChallengeDeployValues(challenge.deploy)),
        },
    );

    const links = generateContainerLinks(challenge.deploy, name);

    return {
        ...runningChallenge,
        links,
    };
}

export async function deleteInstance(instanceName: string) {
    await fetch(
        `https://challenge-manager.cfrt.dev/api/challenge?name=${instanceName}`,
        {
            method: "DELETE",
        },
    );

    await db
        .delete(runningChallenges)
        .where(eq(runningChallenges.id, instanceName));
}
