import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import { UserNav } from "./user-nav";

export default function Header(props: {
    isAdmin?: boolean;
    isLoggedIn?: boolean;
    children: React.ReactNode;
}) {
    return (
        <header
            className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur
                supports-[backdrop-filter]:bg-background/60"
        >
            <div className="relative flex items-center h-14 px-4">
                <Link
                    href="/"
                    className="font-bold flex items-center flex-grow"
                >
                    KubeCTF
                </Link>

                {props.children}

                <div className="flex items-center gap-3 ml-auto">
                    <ModeToggle />
                    {props.isLoggedIn === true ? (
                        <UserNav />
                    ) : (
                        <div className="flex gap-2">
                            <Link href="/sign-in">
                                <Button variant="ghost">Sign in</Button>
                            </Link>
                            <Link href="/sign-up">
                                <Button className="border" variant="ghost">
                                    Sign up
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
