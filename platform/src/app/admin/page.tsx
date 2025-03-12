import {
    Sidebar,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "~/components/ui/sidebar";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";

export default function Page() {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "19rem",
                } as React.CSSProperties
            }
        >
            <Sidebar variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <a href="/admin">
                                    <div className="flex flex-col gap-0.5 leading-none">
                                        <span className="text-2xl font-bold">Admin page</span>
                                    </div>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarMenuItem>
                    <SidebarGroup>
                        <SidebarMenuButton asChild>
                            <a href="/admin/users">Users</a>
                        </SidebarMenuButton>
                    </SidebarGroup>
                </SidebarMenuItem>
            </Sidebar>
            <SidebarInset>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <div className="aspect-video rounded-xl bg-muted/50" />
                        <div className="aspect-video rounded-xl bg-muted/50" />
                        <div className="aspect-video rounded-xl bg-muted/50" />
                    </div>
                    <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
