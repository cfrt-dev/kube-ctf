import { ChartColumnBig, CircleUser, Flag, Settings, Users } from "lucide-react";
import Link from "next/link";
import ThemedToast from "~/components/themed-toast";
import {
    Sidebar,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "~/components/ui/sidebar";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <style>
                {`
                body {
                    background: #18181b;
                }
                `}
            </style>
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "16rem",
                    } as React.CSSProperties
                }
            >
                <Sidebar variant="inset">
                    <SidebarHeader>
                        <SidebarMenu>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold">Admin page</span>
                            </div>
                        </SidebarMenu>
                    </SidebarHeader>
                    <SidebarMenuItem>
                        <SidebarGroup>
                            <SidebarMenuButton asChild>
                                <Link href="/admin/dashboard">
                                    <ChartColumnBig className="mr-2 h-4 w-4" />
                                    Dashboard
                                </Link>
                            </SidebarMenuButton>
                            <SidebarMenuButton asChild>
                                <Link href="/admin/users">
                                    <CircleUser className="mr-2 h-4 w-4" />
                                    Users
                                </Link>
                            </SidebarMenuButton>
                            <SidebarMenuButton asChild>
                                <Link href="/admin/teams">
                                    <Users className="mr-2 h-4 w-4" />
                                    Teams
                                </Link>
                            </SidebarMenuButton>
                            <SidebarMenuButton asChild>
                                <Link href="/admin/challenges">
                                    <Flag className="mr-2 h-4 w-4" />
                                    Challenges
                                </Link>
                            </SidebarMenuButton>
                            <SidebarMenuButton asChild>
                                <Link href="/admin/settings">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </Link>
                            </SidebarMenuButton>
                        </SidebarGroup>
                    </SidebarMenuItem>
                </Sidebar>
                <SidebarInset>{children}</SidebarInset>
            </SidebarProvider>
            <ThemedToast />
        </>
    );
}
