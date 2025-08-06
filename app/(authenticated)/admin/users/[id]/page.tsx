"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Shield, History, Filter, ExternalLink, Edit } from "lucide-react";
import { toast } from "sonner";
import type { UserDto, AuditLogDto, SortDirection, RoleDto } from "@/lib/types";
import { getUserById, getUserAuditLogs } from "@/lib/actions/user";
import { getAllRoles } from "@/lib/actions";
import { AuditTable } from "@/components/audit-table";
import { AuditDialog } from "@/components/audit-dialog";
import { LastUpdated } from "@/components/last-updated";
import { PermissionBadge } from "@/components/permission-badge";
import { Separator } from "@/components/ui/separator";
import { UserDialog } from "@/components/user-dialog";

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = parseInt(params.id as string, 10);

  const [user, setUser] = useState<UserDto | null>(null);
  const [userAudits, setUserAudits] = useState<AuditLogDto[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>("auditTimestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("DESC");
  const [totalAudits, setTotalAudits] = useState(0);

  const [viewingAudit, setViewingAudit] = useState<AuditLogDto | null>(null);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  const loadUserData = useCallback(async () => {
    try {
      const response = await getUserById(userId);
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        toast.error(response.message || "Failed to load user data");
        router.push("/admin/users");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("An error occurred while loading user data");
      router.push("/admin/users");
    }
  }, [userId, router]);

  const loadUserAuditLogs = useCallback(
    async (isReload: boolean = false) => {
      try {
        if (!isReload) {
          toast.loading("Loading user audit logs...", { id: "loading-user-audits" });
        }

        const response = await getUserAuditLogs(userId, {
          page: currentPage,
          size: pageSize,
          sortBy: sortBy,
          sortDirection: sortDirection,
        });

        if (response.success && response.data) {
          setUserAudits(response.data.items);
          setTotalAudits(response.data.totalItems);
          if (isReload) {
            toast.success("Audit logs reloaded successfully");
          }
          setResetTrigger(prev => prev + 1);
        } else {
          toast.error(response.message || "Failed to load user audit logs");
        }

        setTimeout(() => {
          toast.dismiss("loading-user-audits");
        }, 500);
      } catch (error) {
        console.error("Error loading user audit logs:", error);
        toast.error("An error occurred while loading audit logs");
        setTimeout(() => {
          toast.dismiss("loading-user-audits");
        }, 500);
      }
    },
    [userId, currentPage, pageSize, sortBy, sortDirection]
  );

  const loadRoles = useCallback(async () => {
    try {
      const response = await getAllRoles();

      if (response.success && response.data) {
        setRoles(response.data);
      } else {
        console.log(response.message || "Failed to load roles");
      }
    } catch (error) {
      console.error("Error loading roles:", error);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    if (!isNaN(userId)) {
      Promise.all([loadUserData(), loadUserAuditLogs()]).finally(() => {
        setResetTrigger(prev => prev + 1);
      });
    } else {
      toast.error("Invalid user ID");
      router.push("/admin/users");
    }
  }, [userId, loadUserData, loadUserAuditLogs, router]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortDirection("ASC");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setUserAudits([]);
  };

  const handleViewAudit = (audit: AuditLogDto) => {
    setViewingAudit(audit);
    setIsAuditDialogOpen(true);
  };

  const handleViewAllAudits = () => {
    router.push(`/admin/audit?userId=${userId}`);
  };

  const handleReload = () => {
    loadUserAuditLogs(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/users")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
            <p className="text-muted-foreground">
              Detailed information about {user?.username || "--"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user && !user.roles.some(role => role.name === "ADMIN") && (
            <Button size="sm" className="gap-2" onClick={() => setIsUserDialogOpen(true)}>
              <Edit className="h-4 w-4" />
              Edit User
            </Button>
          )}
          <LastUpdated onRefresh={handleReload} resetTrigger={resetTrigger} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">User ID:</span>
              <span className="font-medium">#{user?.id || "--"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Username:</span>
              <span className="font-medium">{user?.username || "--"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={user?.active || "--" ? "default" : "secondary"}>
                {user?.active || "--" ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Roles:</span>
              <span className="font-medium">{user?.roles.length || "--"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roles & Permissions
            </CardTitle>
            <CardDescription>User roles and their associated permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user && user.roles.length > 0 ? (
                user.roles.map(role => (
                  <div key={role.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{role.name}</h4>
                      <Badge variant={role.isSystemRole ? "default" : "outline"}>
                        {role.isSystemRole ? "System" : "Custom"}
                      </Badge>
                    </div>
                    {role.description && (
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    )}
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Permissions:</span>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.length > 0 ? (
                          role.permissions.map((permission, index) => (
                            <PermissionBadge
                              key={index}
                              permission={permission}
                              variant="outline"
                              className="text-xs"
                            />
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No specific permissions
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No roles assigned to this user
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* User Audit Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Recent audit logs for this user (showing last {pageSize} entries)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleViewAllAudits} className="gap-2">
                <Filter className="h-4 w-4" />
                View All with Filters
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {userAudits.length > 0 ? (
            <AuditTable
              audits={userAudits}
              onViewAudit={handleViewAudit}
              onDeleteAudit={() => {}} // Disable delete for user view
              searchTerm=""
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={handleSort}
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalAudits}
              onPageChange={handlePageChange}
            />
          ) : (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">No Activity Found</h3>
              <p className="text-muted-foreground">This user has no recorded activity yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <UserDialog
        open={isUserDialogOpen}
        onOpenChange={setIsUserDialogOpen}
        user={user}
        roles={roles}
        isCreateMode={false}
        onSuccess={loadUserData}
      />

      <AuditDialog
        audit={viewingAudit}
        isOpen={isAuditDialogOpen}
        onClose={() => {
          setIsAuditDialogOpen(false);
          setViewingAudit(null);
        }}
      />
    </div>
  );
}
