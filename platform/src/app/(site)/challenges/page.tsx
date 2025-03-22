import { and, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { Suspense } from "react";
import ChallengesFilter from "~/components/challenge-filter";
import { FilterProvider } from "~/components/challenge-filter-context";
import ChallengeList from "~/components/challenge-list";
import { db } from "~/server/db";
import { challenges, dynamicChallenges, submissions } from "~/server/db/schema";
import type { Link, PublicChallengeInfo } from "~/server/db/types";
import { parseJWT } from "~/server/utils";

export default async function ChallengesPage() {
    const cookie = await cookies();
    const token = cookie.get("token")?.value ?? "";
    const jwt = await parseJWT(token);
    if (jwt.isErr()) return false;

    const user_id = jwt.value.user_id;

    const challengesPromise = db
        .select({
            id: challenges.id,
            name: challenges.name,
            description: challenges.description,
            category: challenges.category,
            author: challenges.author,
            hints: challenges.hints,
            files: challenges.files,
            links: sql<Link[]>`NULL`,
            instanceName: sql<string>`NULL`,
            isSolved: sql<boolean>`${submissions.id} IS NOT NULL`,
            points: challenges.points,
            initialPoints: challenges.initialPoints,
            type: challenges.type,
            deployType: challenges.deployType,
            minimum: dynamicChallenges.minimum,
            decay: dynamicChallenges.decay,
            function: dynamicChallenges.type,
        })
        .from(challenges)
        .where(eq(challenges.hidden, false))
        .leftJoin(
            submissions,
            and(
                eq(submissions.challenge_id, challenges.id),
                eq(submissions.user_id, user_id),
                eq(submissions.type, true),
            ),
        )
        .leftJoin(dynamicChallenges, eq(dynamicChallenges.id, challenges.id))
        .orderBy(challenges.id);

    const categoriesPromise = db
        .select({
            name: sql<string>`DISTINCT ${challenges.category}`,
        })
        .from(challenges)
        .orderBy(challenges.category);

    const [rows, categories] = await Promise.all([challengesPromise, categoriesPromise]);

    const challengeList: PublicChallengeInfo[] = rows.map((challenge) => ({
        id: challenge.id,
        name: challenge.name,
        description: challenge.description,
        category: challenge.category,
        author: challenge.author,
        value: {
            type: challenge.type,
            points: challenge.points,
            initialPoints: challenge.initialPoints,
            decayFunction: {
                type: challenge.function,
                decay: challenge.decay,
                minimum: challenge.minimum,
            },
        },
        hints: challenge.hints,
        links: challenge.links,
        files: challenge.files,
        isSolved: challenge.isSolved,
        deployType: challenge.deployType,
    }));

    return (
        <div className="container py-8 mx-auto h-[calc(100vh-57px)] flex flex-col">
            <div className="flex gap-8 flex-1 overflow-auto ">
                <FilterProvider>
                    <div className="w-64 shrink-0 space-y-6">
                        <Suspense>
                            <ChallengesFilter categories={categories} />
                        </Suspense>
                    </div>

                    <div className="flex-1 flex flex-col space-y-4">
                        <h1 className="text-3xl font-bold">Challenges</h1>
                        <div className="flex-1 overflow-y-auto py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <ChallengeList challenges={challengeList} />
                            </div>
                        </div>
                    </div>
                </FilterProvider>
            </div>
        </div>
    );
}
