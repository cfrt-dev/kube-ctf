import { type NextRequest, NextResponse } from "next/server";

import { registerSchema } from "~/app/(auth)/sign-up/form";
import { createUser } from "~/server/auth/user";
import { createToken } from "~/server/utils";

export async function POST(req: NextRequest): Promise<NextResponse> {
    let registerForm;
    try {
        const body = (await req.json()) as object;
        registerForm = registerSchema.parse(body);
    } catch {
        return NextResponse.json(
            { message: "Wrong registration body" },
            { status: 401 },
        );
    }

    let user;
    try {
        user = await createUser(registerForm);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message },
                { status: 409 },
            );
        }
        return NextResponse.json({ status: 501 });
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
