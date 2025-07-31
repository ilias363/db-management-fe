import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw } from "lucide-react";

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | "active";
  onStatusFilterChange: (value: "all" | "active") => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export function UserFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  isLoading,
  onRefresh,
}: UserFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          defaultValue={searchTerm}
          onKeyDown={e => {
            if (e.key === "Enter") {
              const target = e.target as HTMLInputElement;
              onSearchChange(target.value);
            }
          }}
          className="pl-10 w-64"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Only Active</SelectItem>
        </SelectContent>
      </Select>
      <Button size="sm" variant="outline" onClick={onRefresh} disabled={isLoading} className="gap-2">
        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
  );
}
