import { UsersTable } from "~/components/tables/users";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";

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
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.type,
            isActive: users.banned,
        })
        .from(users);

    return (
        <div className="flex flex-col h-[calc(100vh-16px)]">
            <div className="p-8">
                <h1 className="text-3xl font-bold">Challenges</h1>
            </div>
            <div className="flex-1 px-6 pb-6 overflow-hidden">
                <UsersTable users={rows} initialSearch={search} />
            </div>
        </div>
    );
}
