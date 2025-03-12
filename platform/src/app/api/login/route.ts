import bcrypt from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";

import { fromPromise } from "neverthrow";
import { loginSchema } from "~/app/(auth)/sign-in/form";
import { getUserByEmail } from "~/server/auth/user";
import { createToken } from "~/server/utils";

export async function POST(req: NextRequest) {
    const requestJson = await fromPromise(req.json(), () => {
        return NextResponse.json({ message: "Wrong registration body" }, { status: 401 });
    });

    if (requestJson.isErr()) {
        return requestJson.error;
    }

    const loginForm = loginSchema.safeParse(requestJson.value);
    if (!loginForm.success) {
        return NextResponse.json({ message: "Wrong registration body" }, { status: 401 });
    }

    const user = await getUserByEmail(loginForm.data.email);

    if (user.isErr()) {
        return NextResponse.json(
            { message: user.error },
            { status: user.error !== "Wrong email or password" ? 400 : 501 },
        );
    }

    const passwordCheck = await bcrypt.compare(loginForm.data.password, user.value.password);

    if (passwordCheck === false) {
        return NextResponse.json({ message: "Wrong username or password" }, { status: 403 });
    }

    const { id, name, type } = user.value;
    const { cookie } = createToken({ id, name, type });

    return NextResponse.redirect(new URL("/", req.url), {
        headers: { "Set-Cookie": cookie, Location: "/" },
    });
}
