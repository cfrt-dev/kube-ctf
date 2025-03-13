"use client";

import { type ColumnDef, createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import Fuse from "fuse.js";
import { Pencil, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { debounce } from "~/lib/utils";
import { Badge } from "./ui/badge";

type ChallengeRow = {
    id: number;
    name: string;
    category: string;
    points: number;
    solves: number;
    author: string;
    status: string;
};

interface SearchableTableProps {
    data: ChallengeRow[];
    initialSearch: string;
}

export default function SearchableTable({ data, initialSearch }: SearchableTableProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [filteredData, setFilteredData] = useState<ChallengeRow[]>(data);

    const fuseOptions = useMemo(
        () => ({
            keys: ["id", "name", "category", "author", "status"],
            threshold: 0.3,
        }),
        [],
    );

    const fuse = useMemo(() => new Fuse(data, fuseOptions), [data, fuseOptions]);

    const columnHelper = createColumnHelper<ChallengeRow>();

    const columns = useMemo<ColumnDef<ChallengeRow>[]>(
        () =>
            [
                columnHelper.accessor("id", {
                    header: () => "ID",
                    cell: (info) => info.getValue(),
                    size: 60,
                }),
                columnHelper.accessor("name", {
                    header: () => "Name",
                    cell: (info) => info.getValue(),
                    size: 200,
                }),
                columnHelper.accessor("category", {
                    header: () => "Category",
                    cell: (info) => info.getValue(),
                    size: 150,
                }),
                columnHelper.accessor("points", {
                    header: () => "Points",
                    cell: (info) => info.getValue(),
                    size: 80,
                }),
                columnHelper.accessor("solves", {
                    header: () => "Solves",
                    cell: (info) => info.getValue(),
                    size: 80,
                }),
                columnHelper.accessor("author", {
                    header: () => "Author",
                    cell: (info) => info.getValue(),
                    size: 150,
                }),
                columnHelper.accessor("status", {
                    header: () => "Status",
                    cell: (info) => {
                        const status = info.getValue();
                        const variant = status === "hidden" ? "secondary" : "default";
                        const text = status === "hidden" ? "Hidden" : "Visible";
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
            ] as Array<ColumnDef<ChallengeRow, unknown>>,
        [router],
    );

    const updateUrl = useCallback(
        (filterValue: string) => {
            const params = new URLSearchParams();
            if (filterValue) {
                params.set("search", filterValue);
            }
            const queryString = params.toString();
            window.history.pushState({}, "", queryString ? `${pathname}?${queryString}` : pathname);
        },
        [pathname],
    );

    useEffect(() => {
        if (!searchTerm) {
            setFilteredData(data);
            return;
        }
        const results = fuse.search(searchTerm);
        const filteredItems = results.map((result) => result.item);
        setFilteredData(filteredItems);
    }, [searchTerm, fuse, data]);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        debounce((value: string) => {
            updateUrl(value);
        }, 300);
    };

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="flex flex-col h-full border rounded-md">
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search..."
                        className="pl-8"
                        defaultValue={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="w-full table-fixed">
                    <thead className="bg-muted sticky top-0 z-10">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="px-4 py-3 text-left text-sm font-medium text-muted-foreground tracking-wider"
                                        style={{ width: header.column.getSize() }}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="border-b hover:bg-muted/50 transition-colors">
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className="px-4 py-3 text-sm overflow-hidden text-ellipsis whitespace-nowrap"
                                            style={{ width: cell.column.getSize() }}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                                >
                                    No results found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
