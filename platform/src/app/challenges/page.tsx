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
        <div className="container py-8 mx-auto">
            <div className="flex gap-8">
                <FilterProvider>
                    <Suspense fallback={<div className="w-64 h-96 animate-pulse bg-muted rounded-md" />}>
                        <ChallengesFilter />
                    </Suspense>

                    <div className="flex-1 space-y-4">
                        <h1 className="text-3xl font-bold">Challenges</h1>
                        <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" />}>
                            <ChallengeList challenges={rows} />
                        </Suspense>
                    </div>
                </FilterProvider>
            </div>
        </div>
    );
}
