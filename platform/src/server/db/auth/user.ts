"use server";
import bcrypt from "bcryptjs";

import { db } from "..";
import { users } from "../schema";
import type { User } from "../types";
import type { RegisterFormData } from "~/app/(auth)/sign-up/form";
import { eq } from "drizzle-orm";

export async function createUser(user: RegisterFormData): Promise<User> {
    const result = await db
        .select()
        .from(users)
        .where(eq(users.email, user.email))
        .limit(1);

    if (result.length === 1) {
        throw new Error("User with this email already exists");
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

    return rows[0] as User;
}

export async function getUserByEmail(email: string): Promise<User> {
    const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (result.length === 0) {
        throw new Error("Wrong email or password");
    }

    return result[0] as User;
}
