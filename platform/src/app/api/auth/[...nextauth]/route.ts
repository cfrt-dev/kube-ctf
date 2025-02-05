/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "~/env";

const handler = NextAuth({
    session: {
        strategy: "jwt",
    },
    secret: env.AUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: "credentials",
            id: "credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
                username: { label: "Username", type: "text" },
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Please enter an email and password");
                }

                return;
            },
        }),
    ],
    debug: env.NODE_ENV == "development",
});

export { handler as GET, handler as POST };
