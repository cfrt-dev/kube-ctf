import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "~/components/theme-provider";
import Header from "~/components/header";
import UserHeader from "~/components/user-header";
import ThemedToast from "~/components/themed-toast";
import { cookies } from "next/headers";
import { parseJWT } from "~/server/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Kube CTF",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    let isLoggedIn = false;
    let isAdmin = false;

    const cookie = await cookies();
    const token = cookie.get("token");
    if (token !== undefined) {
        const { verified, jwt } = await parseJWT(token.value);
        if (verified) {
            isLoggedIn = true;
            isAdmin = jwt?.payload.type === "admin";
        }
    }

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <div className="relative flex min-h-screen flex-col">
                        <Header isLoggedIn={isLoggedIn} isAdmin={isAdmin}>
                            <UserHeader />
                        </Header>
                        <main className="flex-1">{children}</main>
                        <ThemedToast />
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
