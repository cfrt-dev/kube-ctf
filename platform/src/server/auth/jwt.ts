import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getUserId() {
    const cookie = await cookies();
    const token = cookie.get("token")!.value;
    return jwt.decode(token)!.userId as number;
}
