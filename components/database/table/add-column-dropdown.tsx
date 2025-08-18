"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, Table, Key, Link } from "lucide-react";
import {
  AddStandardColumnDialog,
  AddPrimaryKeyColumnDialog,
  AddForeignKeyColumnDialog,
} from "./column-dialogs";

interface AddColumnDropdownProps {
  schemaName: string;
  tableName: string;
  onSuccess?: () => void;
  disabled?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg";
}

export function AddColumnDropdown({
  schemaName,
  tableName,
  onSuccess,
  disabled = false,
  className = "",
  size = "sm",
}: AddColumnDropdownProps) {
  const [standardDialogOpen, setStandardDialogOpen] = useState(false);
  const [primaryKeyDialogOpen, setPrimaryKeyDialogOpen] = useState(false);
  const [foreignKeyDialogOpen, setForeignKeyDialogOpen] = useState(false);

  const handleSuccess = () => {
    onSuccess?.();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size={size} className={`gap-2 ${className}`} disabled={disabled}>
            <Plus className="h-4 w-4" />
            Add Column
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setStandardDialogOpen(true)} className="cursor-pointer">
            <Table className="h-4 w-4 mr-2" />
            <div>
              <div className="font-medium">Standard Column</div>
              <div className="text-xs text-muted-foreground">Regular table column</div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setPrimaryKeyDialogOpen(true)}
            className="cursor-pointer"
          >
            <Key className="h-4 w-4 mr-2" />
            <div>
              <div className="font-medium">Primary Key Column</div>
              <div className="text-xs text-muted-foreground">Unique identifier column</div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setForeignKeyDialogOpen(true)}
            className="cursor-pointer"
          >
            <Link className="h-4 w-4 mr-2" />
            <div>
              <div className="font-medium">Foreign Key Column</div>
              <div className="text-xs text-muted-foreground">Reference to another table</div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Standard Column Dialog */}
      <AddStandardColumnDialog
        schemaName={schemaName}
        tableName={tableName}
        open={standardDialogOpen}
        onOpenChange={setStandardDialogOpen}
        onSuccess={handleSuccess}
      />

      {/* Primary Key Column Dialog */}
      <AddPrimaryKeyColumnDialog
        schemaName={schemaName}
        tableName={tableName}
        open={primaryKeyDialogOpen}
        onOpenChange={setPrimaryKeyDialogOpen}
        onSuccess={handleSuccess}
      />

      {/* Foreign Key Column Dialog */}
      <AddForeignKeyColumnDialog
        schemaName={schemaName}
        tableName={tableName}
        open={foreignKeyDialogOpen}
        onOpenChange={setForeignKeyDialogOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
}
