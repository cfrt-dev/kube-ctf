import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ChallengeDeploy, Link } from "~/server/db/types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function capitalize(str: string): string {
    if (!str) {
        return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
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
