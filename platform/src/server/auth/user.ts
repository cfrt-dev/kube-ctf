"use server";
import bcrypt from "bcryptjs";

import { eq } from "drizzle-orm";
import { type Result, err, ok } from "neverthrow";
import type { RegisterFormData } from "~/app/(auth)/sign-up/form";
import { db } from "../db";
import { users } from "../db/schema";
import type { User } from "../db/types";

export async function createUser(user: RegisterFormData): Promise<Result<User, string>> {
    const result = await db.select().from(users).where(eq(users.email, user.email)).limit(1);

    if (result.length === 1) {
        return err("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(user.password, 12);

    const rows = await db
        .insert(users)
        .values({
            name: user.username,
            email: user.email,
            password: hashedPassword,
        })
        .returning();

    return ok(rows[0]!);
}

export async function getUserByEmail(email: string): Promise<Result<User, string>> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (result.length === 0) {
        return err("Wrong email or password");
    }

    return ok(result[0]!);
}
