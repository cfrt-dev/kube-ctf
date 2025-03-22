import { and, count, eq } from "drizzle-orm";
import Link from "next/link";
import SortableTable from "~/components/sortable-table";
import { Button } from "~/components/ui/button";
import { db } from "~/server/db";
import { challenges, submissions } from "~/server/db/schema";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{
        search?: string;
    }>;
}) {
    const { search } = await searchParams;
    const rows = await db
        .select({
            id: challenges.id,
            name: challenges.name,
            category: challenges.category,
            points: challenges.points,
            solves: count(submissions.id),
            author: challenges.author,
            hidden: challenges.hidden,
        })
        .from(challenges)
        .leftJoin(submissions, and(eq(submissions.challenge_id, challenges.id), eq(submissions.type, true)))
        .orderBy(challenges.id)
        .groupBy(challenges.id);

    return (
        <div className="flex flex-col h-[calc(100vh-16px)]">
            <div className="p-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Challenges</h1>
                    <Button asChild>
                        <Link href="/admin/challenges/new">Add Challenge</Link>
                    </Button>
                </div>
            </div>
            <div className="flex-1 px-6 pb-6 overflow-hidden">
                <SortableTable data={rows} initialSearch={search || ""} />
            </div>
        </div>
    );
}
