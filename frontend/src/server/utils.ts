import { serialize } from "cookie";
import * as jose from "jose";
import jwt from "jsonwebtoken";
import { type Result, err, fromPromise, ok } from "neverthrow";
import { env } from "~/env";
import type { UserType } from "./db/types";

export interface JWTClaim {
    user_id: number;
    team_id: number | null;
    name: string;
    type: UserType;
}

const secretKey = new TextEncoder().encode(env.AUTH_SECRET);

export function createToken(object: JWTClaim): { token: string; cookie: string } {
    const token = jwt.sign(object, env.AUTH_SECRET, { expiresIn: "24h" });

    const cookie = serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
    });

    return { token, cookie };
}

export async function parseJWT(token: string): Promise<Result<JWTClaim, null>> {
    const result = await fromPromise(jose.jwtVerify<JWTClaim>(token, secretKey), () => null);

    if (result.isErr()) {
        return err(result.error);
    }

    return ok(result.value.payload);
}
