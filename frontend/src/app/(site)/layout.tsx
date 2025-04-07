import "~/styles/globals.css";

import { cookies } from "next/headers";
import Header from "~/components/header";
import ThemedToast from "~/components/themed-toast";
import UserHeader from "~/components/user-header";
import { parseJWT } from "~/server/utils";

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
        <div className="relative flex min-h-screen flex-col">
            <Header isLoggedIn={isLoggedIn}>
                <UserHeader isAdmin={isAdmin} />
            </Header>
            <main className="flex-1">{children}</main>
            <ThemedToast />
        </div>
    );
}
