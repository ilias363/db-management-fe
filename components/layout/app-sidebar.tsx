"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/stores/auth-store";
import { useLogout } from "@/lib/hooks/use-logout";
import { ThemeToggle } from "@/components/theme/theme-toggle";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  comingSoon?: boolean;
}

const dashboardMenuItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
];

const adminMenuItems: NavItem[] = [
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Role Management",
    href: "/admin/roles",
    icon: Shield,
  },
  {
    title: "Audit Logs",
    href: "/admin/audit",
    icon: FileText,
  },
];

const globalMenuItems: NavItem[] = [
  {
    title: "Database Explorer",
    href: "/database",
    icon: Database,
    comingSoon: true,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const logout = useLogout();

  const isAdmin = user?.roles?.some(role => role.name === "ADMIN");

  return (
    <Sidebar variant="inset" collapsible="icon">
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
              {dashboardMenuItems.map(item => (
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
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map(item => (
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
        <SidebarGroup>
          <SidebarGroupLabel>Database</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {globalMenuItems.map(item => (
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
                <DropdownMenuItem onClick={() => toast("Profile feature coming soon!")}>
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
