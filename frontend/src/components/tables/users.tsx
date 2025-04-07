"use client";

import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import SortableTable from "../sortable-table";

type User = {
    id: number;
    name: string;
    email: string;
    role: "admin" | "user";
    isActive: boolean;
};

interface UsersTableProps {
    users: User[];
    initialSearch?: string;
}

export function UsersTable({ users, initialSearch = "" }: UsersTableProps) {
    const columnHelper = createColumnHelper<User>();

    const columns: ColumnDef<User, any>[] = [
        columnHelper.accessor("id", {
            header: "ID",
            size: 100,
        }),
        columnHelper.accessor("name", {
            header: "Name",
            cell: (info) => info.getValue(),
            size: 200,
        }),
        columnHelper.accessor("email", {
            header: "Email",
            size: 200,
        }),
        columnHelper.accessor("role", {
            header: "Role",
            cell: (info) => {
                const role = info.getValue();
                const variant = role === "admin" ? "destructive" : "default";
                return <Badge variant={variant}>{role}</Badge>;
            },
            size: 120,
        }),
        columnHelper.accessor("isActive", {
            header: "Status",
            cell: (info) => {
                const isActive = info.getValue();
                return <Badge>{isActive ? "Active" : "Inactive"}</Badge>;
            },
            size: 100,
        }),
        columnHelper.display({
            id: "actions",
            header: () => null,
            cell: (info) => (
                <Button variant="outline" size="sm" onClick={() => console.log(info.row.original)}>
                    <Eye className="h-4 w-4" />
                </Button>
            ),
            size: 100,
        }),
    ];

    return (
        <SortableTable
            data={users}
            columns={columns}
            initialSearch={initialSearch}
            searchKeys={["name", "email", "role"]}
        />
    );
}
