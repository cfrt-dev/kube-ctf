import { fromPromise } from "neverthrow";
import { type NextRequest, NextResponse } from "next/server";
import { registerSchema } from "~/app/(site)/(auth)/sign-up/form";

import { createUser } from "~/server/auth/user";
import { createToken } from "~/server/utils";

export async function POST(req: NextRequest): Promise<NextResponse> {
    const requestJson = await fromPromise(req.json(), () => {
        return NextResponse.json({ message: "Wrong registration body" }, { status: 401 });
    });

    if (requestJson.isErr()) {
        return requestJson.error;
    }

    const registerForm = registerSchema.safeParse(requestJson.value);
    if (!registerForm.success) {
        return NextResponse.json({ message: "Wrong registration body" }, { status: 401 });
    }

    const user = await createUser(registerForm.data);

    if (user.isErr()) {
        return NextResponse.json(
            { message: user.error },
            { status: user.error !== "User with this email already exists" ? 400 : 501 },
        );
    }

    const { id, name, type } = user.value;
    const { cookie } = createToken({ user_id: id, team_id: null, name, type });

    return NextResponse.redirect(new URL("/", req.url), {
        headers: { "Set-Cookie": cookie, Location: "/" },
    });
}
