import { useState } from "react";

export const useAuditFilters = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed">("all");
  const [actionTypeFilter, setActionTypeFilter] = useState<"all" | string>("all");
  const [afterDate, setAfterDate] = useState("");
  const [beforeDate, setBeforeDate] = useState("");

  const hasActiveFilters = 
    searchTerm.trim() !== "" || 
    statusFilter !== "all" || 
    actionTypeFilter !== "all" || 
    afterDate !== "" || 
    beforeDate !== "";

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setActionTypeFilter("all");
    setAfterDate("");
    setBeforeDate("");
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    actionTypeFilter,
    setActionTypeFilter,
    afterDate,
    setAfterDate,
    beforeDate,
    setBeforeDate,
    hasActiveFilters,
    clearAllFilters,
  };
};