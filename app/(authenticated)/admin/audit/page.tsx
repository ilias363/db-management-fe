"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Calendar, CalendarDays, User, X } from "lucide-react";
import { toast } from "sonner";
import { AuditLogDto, AuditStats, SortDirection, ActionType } from "@/lib/types";

import { AuditStatsCards } from "@/components/audit/audit-stats-cards";
import { AuditTable } from "@/components/audit/audit-table";
import { AuditDialog } from "@/components/audit/audit-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { LastUpdated } from "@/components/common/last-updated";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAuditData, deleteAuditLog, type AuditDataParams } from "@/lib/actions";
import { useAuditFilters } from "@/lib/hooks/use-audit-filters";

const ACTION_TYPES = Object.values(ActionType);

const DEFAULT_STATS: AuditStats = {
  totalAudits: 0,
  totalFailed: 0,
  failedPercentage: 0,
  last24hActivityCount: 0,
  totalSuccessful: 0,
  mostCommonAction: ActionType.LOGIN,
  averageActionsPerDay: 0,
};

const isValidDateRange = (afterDate: string, beforeDate: string) => {
  if (!afterDate || !beforeDate) return true;
  return new Date(afterDate) <= new Date(beforeDate);
};

export default function AuditPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userIdParam = searchParams.get("userId");
  const filteredUserId = userIdParam ? parseInt(userIdParam, 10) : null;

  const [audits, setAudits] = useState<AuditLogDto[]>([]);
  const [stats, setStats] = useState<AuditStats>(DEFAULT_STATS);
  const [filteredUserInfo, setFilteredUserInfo] = useState<{ username: string } | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>("auditTimestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("DESC");
  const [totalAudits, setTotalAudits] = useState(0);

  const [viewingAudit, setViewingAudit] = useState<AuditLogDto | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [auditToDelete, setAuditToDelete] = useState<AuditLogDto | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  const filters = useAuditFilters();

  // Load user info if filtering by user ID
  const loadUserInfo = useCallback(async () => {
    if (filteredUserId) {
      try {
        const { getUserById } = await import("@/lib/actions");
        const response = await getUserById(filteredUserId);
        if (response.success && response.data) {
          setFilteredUserInfo({ username: response.data.username });
        }
      } catch (error) {
        console.error("Error loading user info:", error);
      }
    } else {
      setFilteredUserInfo(null);
    }
  }, [filteredUserId]);

  useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]);

  const loadData = useCallback(
    async (isReload: boolean = false) => {
      if (!isValidDateRange(filters.afterDate, filters.beforeDate)) {
        toast.error("After date must be before or equal to before date");
        return;
      }

      try {
        toast.loading("Loading audit data...", { id: "loading-audit-logs" });

        const auditParams: AuditDataParams = {
          page: currentPage,
          size: pageSize,
          sortBy: sortBy,
          sortDirection: sortDirection,
        };

        if (filters.searchTerm.trim()) {
          auditParams.search = filters.searchTerm.trim();
        }

        if (filters.statusFilter !== "all") {
          auditParams.successful = filters.statusFilter === "success";
        }

        if (filters.actionTypeFilter !== "all") {
          auditParams.actionType = filters.actionTypeFilter;
        }

        if (filters.afterDate) {
          auditParams.after = new Date(filters.afterDate);
        }

        if (filters.beforeDate) {
          auditParams.before = new Date(filters.beforeDate);
        }

        if (filteredUserId) {
          auditParams.userId = filteredUserId;
        }

        const response = await getAuditData(auditParams);

        if (response.success && response.data) {
          if (response.data.audits) {
            setAudits(response.data.audits.items);
            setTotalAudits(response.data.audits.totalItems);
          }

          if (response.data.stats) {
            setStats(response.data.stats);
          }
          if (isReload) toast.success("Data reloaded successfully");
          setResetTrigger(prev => prev + 1);
        } else {
          toast.error(response.message || "Failed to load audit data");
        }

        setTimeout(() => {
          toast.dismiss("loading-audit-logs");
        }, 500);
      } catch (error) {
        setTimeout(() => {
          toast.dismiss("loading-roles");
        }, 500);

        console.error("Error loading audit data:", error);
        toast.error("An error occurred while loading audit data");
      }
    },
    [
      currentPage,
      pageSize,
      sortBy,
      sortDirection,
      filters.searchTerm,
      filters.statusFilter,
      filters.actionTypeFilter,
      filters.afterDate,
      filters.beforeDate,
      filteredUserId,
    ]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReload = () => {
    loadData(true);
  };

  const clearUserFilter = () => {
    router.push("/admin/audit");
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortDirection("ASC");
    }
  };

  const handlePageChange = (page: number) => {
    setAudits([]);
    setCurrentPage(page);
  };

  const handleViewAudit = (audit: AuditLogDto) => {
    setViewingAudit(audit);
    setIsDialogOpen(true);
  };

  const handleDeleteAudit = (audit: AuditLogDto) => {
    setAuditToDelete(audit);
    setIsConfirmOpen(true);
  };

  const confirmDeleteAudit = async () => {
    if (!auditToDelete) return;

    try {
      const toastId = `deleting-audit-${auditToDelete.id}`;
      toast.loading("Deleting audit log...", { id: toastId });

      const response = await deleteAuditLog(auditToDelete.id);

      if (response.success) {
        toast.success(response.message, { id: toastId });
        loadData(true);
        setResetTrigger(prev => prev + 1);
      } else {
        toast.error(response.message, { id: toastId });
      }
    } catch (error) {
      console.error("Error deleting audit log:", error);
      toast.error("An error occurred while deleting the audit log", {
        id: `deleting-audit-error-${Date.now()}`,
      });
    } finally {
      setIsConfirmOpen(false);
      setAuditToDelete(null);
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case "search":
        filters.setSearchTerm(value);
        break;
      case "status":
        filters.setStatusFilter(value as "all" | "success" | "failed");
        break;
      case "actionType":
        filters.setActionTypeFilter(value);
        break;
      case "afterDate":
        filters.setAfterDate(value);
        break;
      case "beforeDate":
        filters.setBeforeDate(value);
        break;
    }
    setCurrentPage(0);
  };

  const activeFiltersCount = [
    filters.searchTerm.trim() !== "",
    filters.statusFilter !== "all",
    filters.actionTypeFilter !== "all",
    filters.afterDate !== "",
    filters.beforeDate !== "",
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            Monitor and review user actions accross the system
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LastUpdated onRefresh={handleReload} resetTrigger={resetTrigger} />
        </div>
      </div>

      <AuditStatsCards stats={stats} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2">
                  <p>View and manage system audit logs and user actions</p>
                  {filteredUserId && filteredUserInfo && (
                    <div className="flex items-center">
                      <Badge variant="secondary" className="gap-1 pr-1">
                        <User className="h-3 w-3" />
                        Filtered by user: {filteredUserInfo.username}
                        <button
                          onClick={clearUserFilter}
                          className="ml-1 hover:bg-muted-foreground/20 rounded-sm p-0.5"
                          title="Clear user filter"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    </div>
                  )}
                </div>
              </CardDescription>
            </div>
            {filters.hasActiveFilters && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount} filter{activeFiltersCount !== 1 ? "s" : ""} active
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={filters.clearAllFilters}
                  className="h-auto px-2 py-1"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search audit logs by user, schema, table, or object..."
                defaultValue={filters.searchTerm}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    const target = e.target as HTMLInputElement;
                    handleFilterChange("search", target.value);
                  }
                }}
                className="pl-9 h-11"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Select
                  value={filters.statusFilter}
                  onValueChange={(value: "all" | "success" | "failed") =>
                    handleFilterChange("status", value)
                  }
                >
                  <SelectTrigger className="h-10 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">✅ Success</SelectItem>
                    <SelectItem value="failed">❌ Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Action Type</label>
                <Select
                  value={filters.actionTypeFilter}
                  onValueChange={value => handleFilterChange("actionType", value)}
                >
                  <SelectTrigger className="h-10 mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {ACTION_TYPES.map(actionType => (
                      <SelectItem key={actionType} value={actionType}>
                        {actionType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  From Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={filters.afterDate}
                    onChange={e => handleFilterChange("afterDate", e.target.value)}
                    className={"pl-9 h-10"}
                    max={filters.beforeDate || undefined}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  To Date
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={filters.beforeDate}
                    onChange={e => handleFilterChange("beforeDate", e.target.value)}
                    className={"pl-9 h-10"}
                    min={filters.afterDate || undefined}
                  />
                </div>
              </div>
            </div>
          </div>

          <AuditTable
            audits={audits}
            onViewAudit={handleViewAudit}
            onDeleteAudit={handleDeleteAudit}
            searchTerm={filters.searchTerm}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalAudits}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>

      <AuditDialog
        audit={viewingAudit}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setViewingAudit(null);
        }}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={open => {
          setIsConfirmOpen(open);
          if (!open) setAuditToDelete(null);
        }}
        onConfirm={confirmDeleteAudit}
        title="Delete Audit Log"
        description={
          auditToDelete
            ? `Are you sure you want to delete audit log #${auditToDelete.id}? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
      />
    </div>
  );
}
