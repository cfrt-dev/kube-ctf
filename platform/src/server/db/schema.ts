import {
    boolean,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    serial,
    text,
    timestamp,
    uniqueIndex,
    varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { ChallengeDeploy } from "./types";

export type UserType = "user" | "admin";
export const UserTypeEnum = pgEnum("UserType", ["user", "admin"]);
export const users = pgTable(
    "users",
    {
        id: serial().primaryKey(),
        name: varchar({ length: 256 }).notNull(),
        email: varchar().notNull().unique(),
        password: varchar().notNull(),
        team_id: integer().unique(),
        verified: boolean().notNull().default(false),
        type: UserTypeEnum().notNull().$type<UserType>().default("user"),
        website: varchar(),
        country: varchar(),
        language: varchar(),
        hidden: boolean().notNull().default(false),
        banned: boolean().notNull().default(false),
        created: timestamp().notNull().defaultNow(),
    },
    (table) => [uniqueIndex().on(table.email)],
);

export const teams = pgTable("teams", {
    id: serial().primaryKey(),
    name: varchar().notNull(),
    password: varchar().notNull(),
    website: varchar(),
    country: varchar(),
    hidden: boolean().notNull().default(false),
    banned: boolean().notNull().default(false),
    captain_id: integer()
        .notNull()
        .unique()
        .references(() => users.id),
    created: timestamp().notNull().defaultNow(),
});

export type ChallengeType = "static" | "dynamic";
export const ChallengeTypeEnum = pgEnum("ChallengeType", ["static", "dynamic"]);
export const challenges = pgTable("challenges", {
    id: serial().primaryKey(),
    name: varchar().notNull(),
    category: varchar().notNull(),
    flag: varchar().notNull(),
    type: ChallengeTypeEnum().notNull().default("static"),
    value: integer().notNull(),
    author: varchar(),
    description: text(),
    hints: varchar().array().notNull().$type<string[]>().default([]),
    dynamicFlag: boolean().notNull().default(false),
    hidden: boolean().notNull().default(false),
    files: boolean().array().notNull().$type<string[]>().default([]),
    deploy: jsonb().notNull().$type<ChallengeDeploy>(),
});

export type ChallengeDecayFunction = "linear" | "logarithmic";
export const ChallengeDecayFunctionEnum = pgEnum("ChallengeDecayFunction", [
    "linear",
    "logarithmic",
]);
export const dynamicChallenge = pgTable("dynamic_challenges", {
    id: serial()
        .unique()
        .references(() => challenges.id),
    initial: integer().notNull(),
    minimum: integer().notNull(),
    decay: integer().notNull(),
    function: ChallengeDecayFunctionEnum()
        .notNull()
        .$type<ChallengeDecayFunction>(),
});

export const runningChallenges = pgTable(
    "running_challenges",
    {
        id: varchar({ length: 10 }).primaryKey(),
        challenge_id: integer().references(() => challenges.id),
        user_id: integer().references(() => users.id),
        flag: varchar().notNull(),
        start_time: timestamp().notNull().defaultNow(),
        end_time: timestamp()
            .notNull()
            .default(sql`NOW() + INTERVAL '1 hour'`),
    },
    (table) => [uniqueIndex().on(table.challenge_id, table.user_id)],
);
