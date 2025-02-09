import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import * as jose from "jose";
import { env } from "~/env";

export interface JWTClaim {
    userId: number;
    username: string;
    type: "user" | "admin";
}

const secretKey = new TextEncoder().encode(env.AUTH_SECRET);

export function createToken(object: object): { token: string; cookie: string } {
    const token = jwt.sign(object, env.AUTH_SECRET, { expiresIn: "24h" });

    const cookie = serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
    });

    return { token, cookie };
}

export async function parseJWT(
    token: string,
): Promise<{ verified: boolean; jwt: jose.JWTVerifyResult<JWTClaim> | null }> {
    try {
        const result = await jose.jwtVerify<JWTClaim>(token, secretKey);
        return {
            verified: true,
            jwt: result,
        };
    } catch {
        return {
            verified: false,
            jwt: null,
        };
    }
}
