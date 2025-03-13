import { eq, sql } from "drizzle-orm";
import { Suspense } from "react";
import ChallengesFilter from "~/components/challenge-filter";
import { FilterProvider } from "~/components/challenge-filter-context";
import ChallengeList from "~/components/challenge-list";
import { db } from "~/server/db";
import { challenges } from "~/server/db/schema";
import type { Link } from "~/server/db/types";

export default async function ChallengesPage() {
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
            isSolved: sql<boolean>`FALSE`,
        })
        .from(challenges)
        .where(eq(challenges.hidden, false));

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
                                <Suspense>
                                    <ChallengeList challenges={rows} />
                                </Suspense>
                            </div>
                        </div>
                    </div>
                </FilterProvider>
            </div>
        </div>
    );
}
