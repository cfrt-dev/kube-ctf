import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import { UserNav } from "./user-nav";

export default function Header(props: {
    isLoggedIn?: boolean;
    children: React.ReactNode;
}) {
    return (
        <header
            className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur
                supports-[backdrop-filter]:bg-background/60"
        >
            <div className="flex h-14 items-center justify-between">
                <Link href="/" className="ml-16 font-bold">
                    KubeCTF
                </Link>
                {props.children}
                <div className="mr-12 flex items-center gap-3">
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
