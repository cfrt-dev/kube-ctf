import { Trophy, Users, User, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export default function UserHeader({ isAdmin }: { isAdmin?: boolean }) {
    return (
        <nav className="ml-10 flex items-center gap-2">
            <Link href="/challenges">
                <Button variant="ghost">Challenges</Button>
            </Link>
            <Link href="/scoreboard">
                <Button variant="ghost">
                    <Trophy className="mr-2 h-4 w-4" />
                    Scoreboard
                </Button>
            </Link>
            <Link href="/teams">
                <Button variant="ghost">
                    <Users className="mr-2 h-4 w-4" />
                    Teams
                </Button>
            </Link>
            <Link href="/users">
                <Button variant="ghost">
                    <User className="mr-2 h-4 w-4" />
                    Users
                </Button>
            </Link>
            {isAdmin === true && (
                <Link href="/admin">
                    <Button variant="ghost">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin
                    </Button>
                </Link>
            )}
        </nav>
    );
}
