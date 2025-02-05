import {
    boolean,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import type { ChallengeDeploy } from "./types";

export type UserType = "user" | "admin";
export const UserTypeEnum = pgEnum("UserType", ["user", "admin"]);
// @ts-expect-error Stoopid drizzle-orm can not create foreign key normally
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    email: varchar("email").notNull(),
    password: varchar("password").notNull(),
    team_id: integer("team_id")
        .unique()
        // @ts-expect-error Stoopid drizzle-orm can not create foreign key normally
        .references(() => teams.id, { onDelete: "set null" }), // eslint-disable-line
    verified: boolean("verified").notNull().default(false),
    type: UserTypeEnum("type").notNull().$type<UserType>().default("user"),
    website: varchar("website"),
    country: varchar("country"),
    language: varchar("language"),
    hidden: boolean("hidden").notNull().default(false),
    banned: boolean("banned").notNull().default(false),
    created: timestamp("created").notNull().defaultNow(),
});

// @ts-expect-error Stoopid drizzle-orm can not create foreign key normally
export const teams = pgTable("teams", {
    id: serial("id").primaryKey(),
    name: varchar("name").notNull(),
    password: varchar("password").notNull(),
    website: varchar("website"),
    country: varchar("country"),
    hidden: boolean("hidden").notNull().default(false),
    banned: boolean("banned").notNull().default(false),
    captain_id: integer("captain_id")
        .notNull()
        .unique()
        // @ts-expect-error Stoopid drizzle-orm can not create foreign key normally
        .references(() => users.id), // eslint-disable-line
    created: timestamp("created").notNull().defaultNow(),
});

export type ChallengeType = "static" | "dynamic";
export const ChallengeTypeEnum = pgEnum("ChallengeType", ["static", "dynamic"]);
export const challenges = pgTable("challenges", {
    id: serial("id").primaryKey(),
    name: varchar("name").notNull(),
    flag: varchar("flag").notNull(),
    type: ChallengeTypeEnum("type").notNull().default("static"),
    author: varchar("name"),
    description: text("description"),
    hints: varchar("hints").array().notNull().$type<string[]>().default([]),
    dynamicFlag: boolean("dynamicFlag").notNull().default(false),
    hidden: boolean("hidden").notNull().default(false),
    files: boolean("files").array().notNull().$type<string[]>().default([]),
    deploy: jsonb("deploy").notNull().$type<ChallengeDeploy>(),
});

export type ChallengeDecayFunction = "linear" | "logarithmic";
export const ChallengeDecayFunctionEnum = pgEnum("ChallengeDecayFunction", [
    "linear",
    "logarithmic",
]);
export const dynamic_challenge = pgTable("dynamic_challenge", {
    id: serial("id")
        .unique()
        .references(() => challenges.id),
    initial: integer("initial").notNull(),
    minimum: integer("minimum").notNull(),
    decay: integer("decay").notNull(),
    function: ChallengeDecayFunctionEnum("function")
        .notNull()
        .$type<ChallengeDecayFunction>(),
});
