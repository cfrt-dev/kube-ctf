import { eq, sql } from "drizzle-orm";
import { ChallengeEditor } from "~/components/admin/challenge/challenge-editor";
import { db } from "~/server/db";
import { type ChallengeDecayFunction, challenges, dynamicChallenges } from "~/server/db/schema";
import type { ChallengeConfig } from "~/server/db/types";

async function getChallengeData(id: string): Promise<ChallengeConfig | null> {
    const rows = await db
        .select({
            name: challenges.name,
            flag: challenges.flag,
            author: challenges.author,
            category: challenges.category,
            description: challenges.description,
            type: challenges.type,
            initialPoints: challenges.initialPoints,
            dynamicFlag: challenges.dynamicFlag,
            hidden: challenges.hidden,
            hints: challenges.hints,
            files: challenges.files,
            deploy: challenges.deploy,
            minimum: sql<number>`${dynamicChallenges.minimum}`,
            decay: sql<number>`${dynamicChallenges.decay}`,
            function: sql<ChallengeDecayFunction>`${dynamicChallenges.type}`,
        })
        .from(challenges)
        .where(eq(challenges.id, Number(id)))
        .leftJoin(dynamicChallenges, eq(dynamicChallenges.id, challenges.id));

    if (rows.length === 0 || rows[0] === undefined) {
        return null;
    }

    const row = rows[0];

    return {
        name: row.name,
        flag: row.flag,
        author: row.author,
        category: row.category,
        description: row.description,
        value: {
            type: row.type,
            initialPoints: row.initialPoints,
            // @ts-ignore
            // TODO: why tsc complain about decayFunction not existing????
            decayFunction:
                row.type === "Dynamic"
                    ? {
                          type: row.function,
                          decay: row.decay,
                          minimum: row.minimum,
                      }
                    : undefined,
        },
        dynamicFlag: row.dynamicFlag,
        hidden: row.hidden,
        hints: row.hints,
        files: row.files,
        deploy: row.deploy ?? undefined,
    };
}

export default async function EditChallengePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let challengeData: ChallengeConfig | null;

    if (id === "new") {
        challengeData = {
            name: "",
            author: "",
            description: "",
            dynamicFlag: false,
            hidden: true,
            flag: "",
            category: "",
            value: {
                type: "Static",
                initialPoints: 1000,
            },
            files: [],
            hints: [],
        };
    } else if (!/^\d+$/.test(id)) {
        return (
            <div className="flex justify-center items-center h-full">
                <h1 className="text-3xl">Wrong challenge id - '{id}'</h1>
            </div>
        );
    } else {
        challengeData = await getChallengeData(id);
    }

    if (challengeData === null) {
        return (
            <div className="flex justify-center items-center h-full">
                <h1 className="text-3xl">No challenge with that id was found - '{id}'</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold ml-4">{id === "new" ? "Add" : "Edit"} Challenge</h1>
            </div>

            <ChallengeEditor initialConfig={challengeData} challengeId={id} />
        </div>
    );
}
