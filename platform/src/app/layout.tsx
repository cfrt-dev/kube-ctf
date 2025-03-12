import "~/styles/globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import Header from "~/components/header";
import { ThemeProvider } from "~/components/theme-provider";
import ThemedToast from "~/components/themed-toast";
import UserHeader from "~/components/user-header";
import { parseJWT } from "~/server/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Kube CTF",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    let isLoggedIn = false;
    let isAdmin = false;

    const cookie = await cookies();
    const tokenString = cookie.get("token")?.value ?? "";
    const jwt = await parseJWT(tokenString);

    if (jwt.isOk()) {
        isLoggedIn = true;
        isAdmin = jwt.value.type === "admin";
    }

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
                    <div className="relative flex min-h-screen flex-col">
                        <Header isLoggedIn={isLoggedIn}>
                            <UserHeader isAdmin={isAdmin} />
                        </Header>
                        <main className="flex-1">{children}</main>
                        <ThemedToast />
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
