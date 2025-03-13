import Link from "next/link";
import SortableTable from "~/components/sortable-table";
import { Button } from "~/components/ui/button";

const challenges = [
    {
        id: 1,
        name: "Web Exploitation 101",
        category: "web",
        points: 100,
        solves: 5,
        author: "admin",
        status: "visible",
    },
    {
        id: 2,
        name: "Buffer Overflow Basic",
        category: "pwn",
        points: 200,
        solves: 2,
        author: "admin",
        status: "hidden",
    },
];

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
                <SortableTable data={challenges} initialSearch={search || ""} />
            </div>
        </div>
    );
}
