import { and, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { Suspense } from "react";
import ChallengesFilter from "~/components/challenge-filter";
import { FilterProvider } from "~/components/challenge-filter-context";
import ChallengeList from "~/components/challenge-list";
import { db } from "~/server/db";
import { challenges, submissions } from "~/server/db/schema";
import type { Link } from "~/server/db/types";
import { parseJWT } from "~/server/utils";

export default async function ChallengesPage() {
    const cookie = await cookies();
    const token = cookie.get("token")?.value ?? "";
    const jwt = await parseJWT(token);
    if (jwt.isErr()) return false;

    const user_id = jwt.value.user_id;

    const rows = await db
        .select({
            id: challenges.id,
            name: challenges.name,
            description: challenges.description,
            category: challenges.category,
            author: challenges.author,
            currentValue: challenges.value,
            type: challenges.type,
            hints: challenges.hints,
            files: challenges.files,
            links: sql<Link[]>`NULL`,
            instanceName: sql<string>`NULL`,
            isSolved: sql<boolean>`${submissions.id} IS NOT NULL`,
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
        );

    return (
        <div className="container py-8 mx-auto h-[calc(100vh-57px)] flex flex-col">
            <div className="flex gap-8 flex-1 overflow-auto ">
                <FilterProvider>
                    <div className="w-64 shrink-0 space-y-6">
                        <Suspense>
                            <ChallengesFilter />
                        </Suspense>
                    </div>

                    <div className="flex-1 flex flex-col space-y-4">
                        <h1 className="text-3xl font-bold">Challenges</h1>
                        <div className="flex-1 overflow-y-auto py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <ChallengeList challenges={rows} />
                            </div>
                        </div>
                    </div>
                </FilterProvider>
            </div>
        </div>
    );
}
