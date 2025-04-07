"use client";

import {
    type ColumnDef,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import Fuse from "fuse.js";
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

interface SortableTableProps<TData extends object> {
    initialData: TData[];
    columns: ColumnDef<TData, any>[];
    fetchMoreData: (
        page: number,
        sortField?: string,
        sortDirection?: "asc" | "desc",
        searchTerm?: string,
    ) => Promise<TData[]>;
    itemsPerPage?: number;
    initialSearch?: string;
    searchKeys?: string[];
    searchThreshold?: number;
}

export default function SortableTable<TData extends object>({
    initialData,
    columns,
    fetchMoreData,
    itemsPerPage = 20,
    initialSearch = "",
    searchKeys = [],
    searchThreshold = 0.3,
}: SortableTableProps<TData>) {
    const pathname = usePathname();
    const [data, setData] = useState<TData[]>(initialData);
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [filteredData, setFilteredData] = useState<TData[]>(initialData);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef<HTMLDivElement>(null);

    // Track if search is active to determine if we should use server or client filtering
    const isSearchActive = searchTerm !== "";

    // Get current sort column and direction
    const currentSort =
        sorting.length > 0 ? { field: sorting[0].id, direction: sorting[0].desc ? "desc" : "asc" } : undefined;

    const fuseOptions = useMemo(
        () => ({
            keys: searchKeys,
            threshold: searchThreshold,
        }),
        [searchKeys, searchThreshold],
    );

    const fuse = useMemo(
        () => (searchKeys.length > 0 ? new Fuse(data, fuseOptions) : null),
        [data, fuseOptions, searchKeys],
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

    // Client-side filtering when search is active
    useEffect(() => {
        if (!searchTerm || !fuse) {
            setFilteredData(data);
            return;
        }
        const results = fuse.search(searchTerm);
        const filteredItems = results.map((result) => result.item);
        setFilteredData(filteredItems);
    }, [searchTerm, fuse, data]);

    // Handle search input changes
    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchTerm(value);
            // updateUrl(value);
            setCurrentPage(1); // Reset to first page on new search
            setData(initialData); // Reset data to initial state
            setHasMore(true); // Reset hasMore flag
        },
        [updateUrl, initialData],
    );

    // Set up intersection observer for infinite scroll
    useEffect(() => {
        if (!loadingRef.current || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoading && hasMore) {
                    loadMoreData();
                }
            },
            { threshold: 0.5 },
        );

        observer.observe(loadingRef.current);

        return () => {
            observer.disconnect();
        };
    }, [isLoading, hasMore]);

    // Function to load more data when scrolling
    const loadMoreData = async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        try {
            const nextPage = currentPage + 1;
            const newData = await fetchMoreData(nextPage, currentSort?.field, currentSort?.direction, searchTerm);

            // If no new data or less data than expected, we've reached the end
            if (newData.length === 0 || newData.length < itemsPerPage) {
                setHasMore(false);
            }

            if (newData.length > 0) {
                setData((prevData) => [...prevData, ...newData]);
                setCurrentPage(nextPage);
            }
        } catch (error) {
            console.error("Error loading more data:", error);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle sort change - reset data and fetch with new sort
    useEffect(() => {
        const loadSortedData = async () => {
            if (!currentSort) return;

            setIsLoading(true);
            setCurrentPage(1);

            try {
                const sortedData = await fetchMoreData(1, currentSort.field, currentSort.direction, searchTerm);

                setData(sortedData);
                setHasMore(sortedData.length >= itemsPerPage);
            } catch (error) {
                console.error("Error loading sorted data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        // Only refetch on sort changes if we have a sort defined
        if (currentSort) {
            loadSortedData();
        }
    }, [sorting]);

    // Helper function to render sort icons
    function renderSortIcon(sorted: false | "asc" | "desc") {
        if (sorted === false) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />;
        }

        if (sorted === "asc") {
            return <ArrowUp className="ml-2 h-4 w-4" />;
        }

        return <ArrowDown className="ml-2 h-4 w-4" />;
    }

    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualSorting: true,
    });

    return (
        <div className="flex flex-col h-full border rounded-md">
            {searchKeys.length > 0 && (
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>
                </div>
            )}
            <div className="flex-1 overflow-auto" ref={tableContainerRef}>
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
                                        {header.isPlaceholder ? null : (
                                            <div className="flex items-center">
                                                {header.column.getCanSort() ? (
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() =>
                                                            header.column.toggleSorting(
                                                                header.column.getIsSorted() === "asc",
                                                            )
                                                        }
                                                        className="p-0 hover:bg-transparent flex items-center"
                                                    >
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext(),
                                                        )}
                                                        {renderSortIcon(header.column.getIsSorted())}
                                                    </Button>
                                                ) : (
                                                    flexRender(header.column.columnDef.header, header.getContext())
                                                )}
                                            </div>
                                        )}
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
                        {hasMore && (
                            <tr>
                                <td colSpan={columns.length} className="p-4" ref={loadingRef}>
                                    <div className="flex justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
