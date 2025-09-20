"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Shield, History, Filter, ExternalLink, Edit } from "lucide-react";
import { AuditLogDto, SortDirection } from "@/lib/types";

import { AuditTable, AuditDetailsDialog } from "@/components/audit";
import { LastUpdated } from "@/components/common";
import { Separator } from "@/components/ui/separator";
import { UserDialog } from "@/components/user";
import { useUserDetail, useUserAudits, useAllRoles } from "@/lib/hooks";
import { ErrorMessage } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";

interface UserDetailsPageContentProps {
  userId: number;
}

export function UserDetailsPageContent({ userId }: UserDetailsPageContentProps) {
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>("auditTimestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.DESC);

  const [viewingAudit, setViewingAudit] = useState<AuditLogDto | null>(null);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

  const [fetchTrigger, setFetchTrigger] = useState(0);
  const prevFetchingRef = useRef(false);

  const {
    data: userResponse,
    isLoading: userLoading,
    isError: userError,
    error: userErrorData,
    refetch: refetchUser,
  } = useUserDetail(userId);

  const {
    data: auditsResponse,
    isLoading: auditsLoading,
    isError: auditsError,
    refetch: refetchAudits,
    isFetching: auditsFetching,
  } = useUserAudits(userId, {
    page: currentPage,
    size: pageSize,
    sortBy,
    sortDirection,
  });

  const { data: rolesResponse, isLoading: rolesLoading } = useAllRoles();

  useEffect(() => {
    if (prevFetchingRef.current && !auditsFetching) {
      setFetchTrigger(prev => prev + 1);
    }
    prevFetchingRef.current = auditsFetching;
  }, [auditsFetching]);

  const user = userResponse?.data;
  const userAudits = auditsResponse?.data?.items || [];
  const totalAudits = auditsResponse?.data?.totalItems || 0;
  const roles = rolesResponse?.data || [];

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(
        sortDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC
      );
    } else {
      setSortBy(field);
      setSortDirection(SortDirection.ASC);
    }
    setCurrentPage(0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewAudit = (audit: AuditLogDto) => {
    setViewingAudit(audit);
    setIsAuditDialogOpen(true);
  };

  const handleViewAllAudits = () => {
    router.push(`/admin/audit?userId=${userId}`);
  };

  const handleRefresh = () => {
    refetchAudits();
  };

  const handleUserSuccess = () => {
    refetchUser();
  };

  if (isNaN(userId)) {
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
          </div>
        </div>
        <ErrorMessage error="Invalid user ID" />
      </div>
    );
  }

  if (userError) {
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
          </div>
        </div>
        <ErrorMessage error={userErrorData?.message || "Failed to load user data"} />
      </div>
    );
  }

  if (!user) {
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
          </div>
        </div>
        {userLoading ? <div>Loading user details...</div> : <ErrorMessage error="User not found" />}
      </div>
    );
  }

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
              Detailed information and activity for {userLoading ? "--" : user.username}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsUserDialogOpen(true)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit User
          </Button>
          <LastUpdated onRefresh={handleRefresh} resetTrigger={fetchTrigger} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          {userLoading ? (
            <CardContent className="space-y-4">
              <Skeleton className="h-5" />
              <Skeleton className="h-5" />
              <Skeleton className="h-5" />
            </CardContent>
          ) : (
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">User ID</span>
                <span className="text-sm font-medium">#{user.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Username</span>
                <span className="text-sm font-medium">{user.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={user.active ? "default" : "secondary"}>
                  {user.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roles & Permissions
            </CardTitle>
          </CardHeader>
          {rolesLoading ? (
            <CardContent className="space-y-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </CardContent>
          ) : (
            <CardContent>
              <div className="space-y-2">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map(role => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between p-2 rounded border"
                    >
                      <div>
                        <Link
                          href={`/admin/roles/${role.id}`}
                          className="font-medium text-sm text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                        >
                          {role.name}
                        </Link>
                        {role.description && (
                          <div className="text-xs text-muted-foreground">{role.description}</div>
                        )}
                      </div>
                      <Badge variant={role.isSystemRole ? "destructive" : "default"}>
                        {role.isSystemRole ? "SYSTEM" : "CUSTOM"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No roles assigned to this user</p>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      <Separator />

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
          {auditsLoading ? (
            <Card>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : auditsError ? (
            <ErrorMessage error="Failed to load audit logs" />
          ) : userAudits.length > 0 ? (
            <AuditTable
              audits={userAudits}
              onViewAudit={handleViewAudit}
              onDeleteAudit={() => toast.info("Audit log can only be deleted in audit page")}
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
        onSuccess={handleUserSuccess}
      />

      <AuditDetailsDialog
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
