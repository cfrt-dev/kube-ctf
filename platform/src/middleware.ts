import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const headers = new Headers(request.headers);
    headers.set("x-current-path", request.nextUrl.pathname);

    const response = NextResponse.next({ headers });

    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Max-Age", "86400");

    if (request.method === "OPTIONS") {
        return new NextResponse(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Max-Age": "86400",
            },
        });
    }

    return response;
}

export const config = {
    matcher: [
        {
            source: "/:path*",
            missing: [{ type: "header", key: "next-action" }],
        },
    ],
};
