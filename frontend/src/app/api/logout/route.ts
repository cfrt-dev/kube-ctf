import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const response = NextResponse.redirect(new URL("/", req.url));
    response.cookies.set("token", "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
    });
    return response;
}
