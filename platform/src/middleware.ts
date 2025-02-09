import { type NextRequest, NextResponse } from "next/server";
import { parseJWT } from "./server/utils";

const authMiddleware = async (
    req: NextRequest,
    next: () => Promise<NextResponse>,
) => {
    const token = req.cookies.get("token");
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    const { verified } = await parseJWT(token.value);
    if (!verified) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    return next();
};

const composeMiddlewares =
    (
        ...middlewares: ((
            req: NextRequest,
            next: () => Promise<NextResponse>,
        ) => Promise<NextResponse>)[]
    ) =>
    async (req: NextRequest): Promise<NextResponse> => {
        let next: () => Promise<NextResponse> = async () => NextResponse.next();

        for (const middleware of [...middlewares].reverse()) {
            const currentNext = next;
            next = async () => middleware(req, currentNext);
        }

        return next();
    };

export function middleware(req: NextRequest) {
    return composeMiddlewares(authMiddleware)(req);
}

export const config = {
    matcher: ["/api/challenge"],
};

export const runtime = "nodejs";
