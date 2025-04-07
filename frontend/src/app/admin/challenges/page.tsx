import Link from "next/link";
import { Suspense } from "react";
import ChallengesTable from "~/components/tables/challenges";
import { Button } from "~/components/ui/button";
import { getChallenges } from "~/server/admin/actions/challenge";

async function ChallengesPageContent({ search }: { search: string | undefined }) {
    const initialChallenges = await getChallenges({
        page: 1,
        itemsPerPage: 20,
        searchTerm: search,
    });

    return <ChallengesTable initialChallenges={initialChallenges} initialSearch={search} />;
}

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{
        search?: string;
    }>;
}) {
    const { search } = await searchParams;

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
                <Suspense fallback={<div>Loading challenges...</div>}>
                    <ChallengesPageContent search={search} />
                </Suspense>
            </div>
        </div>
    );
}
