"use client";

import { AppSidebar } from "../../components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/30 px-6">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">DB Manager</span>
            <div className="flex items-center gap-2">{/* Additional header controls can go here */}</div>
          </div>
        </div>

        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto bg-gradient-to-br from-background via-background to-muted/20 p-6">
            <div className="mx-auto max-w-7xl">{children}</div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
