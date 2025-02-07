import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import { env } from "~/env";

export function createToken(object: object): { token: string; cookie: string } {
    const token = jwt.sign(object, env.AUTH_SECRET, { expiresIn: "1h" });

    const cookie = serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
    });

    return { token, cookie };
}
