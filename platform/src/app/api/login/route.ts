import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { loginSchema } from "~/app/(auth)/sign-in/form";
import { createToken } from "~/server/utils";
import { getUserByEmail } from "~/server/auth/user";

export async function POST(req: NextRequest) {
    let loginForm;
    try {
        const body = (await req.json()) as object;
        loginForm = loginSchema.parse(body);
    } catch {
        return NextResponse.json(
            { message: "Wrong registration body" },
            { status: 401 },
        );
    }

    let user;
    try {
        user = await getUserByEmail(loginForm.email);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message },
                { status: 409 },
            );
        }
        return NextResponse.json({ status: 501 });
    }

    const passwordCheck = await bcrypt.compare(
        loginForm.password,
        user.password,
    );

    if (passwordCheck === false) {
        return NextResponse.json(
            { message: "Wrong username or password" },
            { status: 403 },
        );
    }

    const { cookie } = createToken({
        userId: user.id,
        username: user.name,
        type: user.type,
    });

    return NextResponse.redirect(new URL("/", req.url), {
        headers: { "Set-Cookie": cookie, Location: "/" },
    });
}
