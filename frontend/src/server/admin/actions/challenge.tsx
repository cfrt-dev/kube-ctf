"use server";

import { type SQL, and, asc, count, desc, eq, sql } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import Fuse from "fuse.js";
import { db } from "~/server/db";
import { challenges, submissions } from "~/server/db/schema";

export type ChallengeRow = {
    id: number;
    name: string;
    category: string;
    points: number;
    solves: number;
    author: string | null;
    hidden: boolean;
};

export type SortFields = "id" | "name" | "category" | "points" | "solves" | "author" | "hidden";

interface GetChallengesParams {
    page: number;
    itemsPerPage: number;
    sortField?: SortFields;
    sortDirection?: "asc" | "desc";
    searchTerm?: string;
}

const sortFields: Record<SortFields, PgColumn | SQL> = {
    id: challenges.id,
    name: challenges.name,
    category: challenges.category,
    points: challenges.points,
    solves: sql`solves`,
    author: challenges.author,
    hidden: challenges.hidden,
};

export async function getChallenges({
    page = 1,
    itemsPerPage = 20,
    sortField = "id",
    sortDirection = "asc",
    searchTerm = "",
}: GetChallengesParams): Promise<ChallengeRow[]> {
    const sortFunction = sortDirection === "asc" ? asc : desc;

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
        .orderBy(sortFunction(sortFields[sortField]))
        .groupBy(challenges.id)
        .offset((page - 1) * itemsPerPage)
        .limit(itemsPerPage);

    if (searchTerm.length === 0) {
        return rows;
    }

    const fuse = new Fuse(rows);
    const data = fuse.search(searchTerm).map(({ item }) => item);
    return data;
}
