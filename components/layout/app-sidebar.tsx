"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import {
  Database,
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  LogOut,
  ChevronUp,
  User2,
  User,
  Table,
  View,
  Server,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  comingSoon?: boolean;
  adminOnly?: boolean;
}

const dashboardMenuItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    adminOnly: false,
  },
];

const administrationMenuItems: NavItem[] = [
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
    adminOnly: true,
  },
  {
    title: "Role Management",
    href: "/admin/roles",
    icon: Shield,
    adminOnly: true,
  },
  {
    title: "Audit Logs",
    href: "/admin/audit",
    icon: FileText,
    adminOnly: true,
  },
];

const globalMenuItems: NavItem[] = [
  {
    title: "Database",
    href: "/database",
    icon: Server,
    adminOnly: false,
  },
  {
    title: "Schema Management",
    href: "/database/schemas",
    icon: Database,
    adminOnly: false,
  },
  {
    title: "Table Management",
    href: "/database/tables",
    icon: Table,
    adminOnly: false,
  },
  {
    title: "View Management",
    href: "/database/views",
    icon: View,
    adminOnly: false,
  },
];

const sqlEditorMenuItem: NavItem = {
  title: "SQL Editor",
  href: "/admin/sql-editor",
  icon: FileText,
  adminOnly: true,
};

export function AppSidebar() {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const isAdmin = user?.roles?.some(role => role.name === "ADMIN");
  const router = useRouter();

  if (isLoading || !user) {
    return (
      <Sidebar variant="floating" collapsible="icon">
        <SidebarHeader className="border-b">
          <div className="flex items-center justify-center p-4">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        </SidebarHeader>
      </Sidebar>
    );
  }

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold">DB Manager</span>
              <span className="text-xs text-muted-foreground">Database Management</span>
            </div>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <ThemeToggle />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardMenuItems.map(
                item =>
                  (!item.adminOnly || isAdmin) && (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        className={cn(item.comingSoon && "cursor-not-allowed opacity-60")}
                      >
                        <Link href={item.comingSoon ? "#" : item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.comingSoon && (
                            <SidebarMenuBadge className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                              Soon
                            </SidebarMenuBadge>
                          )}
                          {!item.comingSoon && item.badge && (
                            <SidebarMenuBadge className="bg-primary/20 text-primary">
                              {item.badge}
                            </SidebarMenuBadge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {administrationMenuItems.map(item => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.href)}
                      className={cn(item.comingSoon && "cursor-not-allowed opacity-60")}
                    >
                      <Link href={item.comingSoon ? "#" : item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.comingSoon && (
                          <SidebarMenuBadge className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                            Soon
                          </SidebarMenuBadge>
                        )}
                        {!item.comingSoon && item.badge && (
                          <SidebarMenuBadge className="bg-primary/20 text-primary">
                            {item.badge}
                          </SidebarMenuBadge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Tools</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem key={sqlEditorMenuItem.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === sqlEditorMenuItem.href}
                    className={cn(sqlEditorMenuItem.comingSoon && "cursor-not-allowed opacity-60")}
                  >
                    <Link href={sqlEditorMenuItem.comingSoon ? "#" : sqlEditorMenuItem.href}>
                      <sqlEditorMenuItem.icon className="h-4 w-4" />
                      <span>{sqlEditorMenuItem.title}</span>
                      {sqlEditorMenuItem.comingSoon && (
                        <SidebarMenuBadge className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                          Soon
                        </SidebarMenuBadge>
                      )}
                      {!sqlEditorMenuItem.comingSoon && sqlEditorMenuItem.badge && (
                        <SidebarMenuBadge className="bg-primary/20 text-primary">
                          {sqlEditorMenuItem.badge}
                        </SidebarMenuBadge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        <SidebarGroup>
          <SidebarGroupLabel>Database Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {globalMenuItems.map(
                item =>
                  (!item.adminOnly || isAdmin) && (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={
                          item.href === "/database"
                            ? pathname === item.href
                            : pathname.startsWith(item.href)
                        }
                        className={cn(item.comingSoon && "cursor-not-allowed opacity-60")}
                      >
                        <Link href={item.comingSoon ? "#" : item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.comingSoon && (
                            <SidebarMenuBadge className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                              Soon
                            </SidebarMenuBadge>
                          )}
                          {!item.comingSoon && item.badge && (
                            <SidebarMenuBadge className="bg-primary/20 text-primary">
                              {item.badge}
                            </SidebarMenuBadge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <User2 className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">{user?.username}</span>
                    <span className="truncate text-xs">{isAdmin ? "Admin" : "User"}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
