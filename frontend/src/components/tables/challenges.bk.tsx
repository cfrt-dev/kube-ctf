"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { type ChallengeRow, type SortFields, getChallenges } from "~/server/admin/actions/challenge";
import SortableTable from "../sortable-table";

interface ChallengesTableProps {
    initialChallenges: ChallengeRow[];
    initialSearch?: string;
}

const queryClient = new QueryClient();

export function ChallengesTable({ initialChallenges, initialSearch = "" }: ChallengesTableProps) {
    const router = useRouter();
    const columnHelper = createColumnHelper<ChallengeRow>();

    const columns: ColumnDef<ChallengeRow, any>[] = [
        columnHelper.accessor("id", {
            header: "ID",
            cell: (info) => info.getValue(),
            size: 60,
        }),
        columnHelper.accessor("name", {
            header: "Name",
            cell: (info) => info.getValue(),
            size: 200,
        }),
        columnHelper.accessor("category", {
            header: "Category",
            cell: (info) => info.getValue(),
            size: 150,
        }),
        columnHelper.accessor("points", {
            header: "Points",
            cell: (info) => info.getValue(),
            size: 80,
        }),
        columnHelper.accessor("solves", {
            header: "Solves",
            cell: (info) => info.getValue(),
            size: 80,
        }),
        columnHelper.accessor("author", {
            header: "Author",
            cell: (info) => info.getValue() || "-",
            size: 150,
        }),
        columnHelper.accessor("hidden", {
            header: "Status",
            cell: (info) => {
                const hidden = info.getValue();
                const variant = hidden ? "secondary" : "default";
                const text = hidden ? "Hidden" : "Visible";
                return <Badge variant={variant}>{text}</Badge>;
            },
            size: 100,
        }),
        columnHelper.display({
            id: "edit",
            header: () => null,
            cell: (info) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/challenges/${info.row.original.id}`)}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
            ),
            size: 80,
        }),
    ];

    const fetchMoreChallenges = useCallback(
        async (page: number, sortField?: SortFields, sortDirection?: "asc" | "desc", searchTerm?: string) => {
            return getChallenges({
                page,
                itemsPerPage: 20,
                sortField,
                sortDirection,
                searchTerm,
            });
        },
        [],
    );

    return (
        <QueryClientProvider client={queryClient}>
            <SortableTable
                initialData={initialChallenges}
                columns={columns}
                fetchMoreData={fetchMoreChallenges}
                itemsPerPage={20}
                initialSearch={initialSearch}
                searchKeys={["id", "name", "category", "author"]}
                searchThreshold={0.3}
            />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
