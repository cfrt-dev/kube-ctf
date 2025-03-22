import { sql } from "drizzle-orm";
import {
    boolean,
    index,
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
import type { ChallengeDeploy, ChallengeFile } from "./types";

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

export type ChallengeType = "Static" | "Dynamic";
export const ChallengeTypeEnum = pgEnum("ChallengeType", ["Static", "Dynamic"]);
export const challenges = pgTable("challenges", {
    id: serial().primaryKey(),
    name: varchar().notNull(),
    flag: varchar().notNull(),
    author: varchar().notNull(),
    category: varchar().notNull(),
    description: text().notNull(),
    type: ChallengeTypeEnum().notNull().$type<ChallengeType>(),
    points: integer().notNull(),
    initialPoints: integer().notNull(),
    hidden: boolean().notNull().default(false),
    dynamicFlag: boolean().notNull().default(false),
    hints: varchar().array().notNull().$type<string[]>().default([]),
    files: jsonb().notNull().$type<ChallengeFile[]>(),
    deployType: ChallengeTypeEnum().notNull().default("Static").$type<ChallengeType>(),
    deploy: jsonb().$type<ChallengeDeploy>(),
});

export type ChallengeDecayFunction = "Linear" | "Logarithmic";
export const ChallengeDecayFunctionEnum = pgEnum("ChallengeDecayFunction", ["Linear", "Logarithmic"]);
export const dynamicChallenges = pgTable("dynamicChallenges", {
    id: integer()
        .unique()
        .notNull()
        .references(() => challenges.id),
    minimum: integer(),
    decay: integer(),
    type: ChallengeDecayFunctionEnum().$type<ChallengeDecayFunction>(),
});

export const runningChallenges = pgTable(
    "running_challenges",
    {
        id: varchar({ length: 10 }).primaryKey(),
        challenge_id: integer().references(() => challenges.id),
        user_id: integer().references(() => users.id),
        flag: varchar().notNull(),
        start_time: timestamp().notNull().defaultNow(),
        end_time: timestamp().notNull().default(sql`NOW() + INTERVAL '1 hour'`),
    },
    (table) => [uniqueIndex().on(table.challenge_id, table.user_id)],
);

export const submissions = pgTable(
    "submissions",
    {
        id: serial().primaryKey(),
        user_id: integer().references(() => users.id),
        team_id: integer().references(() => teams.id),
        challenge_id: integer().references(() => challenges.id),
        type: boolean(),
        answer: varchar().notNull(),
        submited_at: timestamp().notNull().defaultNow(),
    },
    (table) => [index().on(table.challenge_id)],
);
