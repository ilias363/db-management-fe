import { AppSidebar } from "@/components/layout";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="w-full h-screen overflow-x-hidden">
        <div className="flex h-14 items-center gap-4 border-b bg-background/95 px-6">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Database Management System</span>
          </div>
        </div>

        <main className="flex-1 overflow-x-hidden">
          <div className="h-full overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20 p-6">
            <div className="mx-auto w-full">{children}</div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
