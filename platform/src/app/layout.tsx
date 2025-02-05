import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "~/components/theme-provider";
import Header from "~/components/header";
import UserHeader from "~/components/user-header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Kube CTF",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Header>
                        <UserHeader />
                    </Header>
                    <main className="relative flex flex-col">{children}</main>
                </ThemeProvider>
            </body>
        </html>
    );
}
