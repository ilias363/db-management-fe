"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Code } from "lucide-react";
import { ExportFormat } from "@/lib/types/export";
import { cn } from "@/lib/utils";

interface ExportButtonProps {
  onExport: (format: ExportFormat) => Promise<void>;
  resourceName?: string;
  disabled?: boolean;
  size?: "sm" | "lg" | "default" | "icon";
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export function ExportButton({
  onExport,
  resourceName = "data",
  disabled = false,
  size = "sm",
  variant = "outline",
  className,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    try {
      setIsExporting(true);
      await onExport(format);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || isExporting}
          className={cn("gap-2", className)}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export {resourceName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleExport("csv")}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4" />
          CSV Format
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("json")}
          disabled={isExporting}
          className="cursor-pointer"
        >
          <Code className="mr-2 h-4 w-4" />
          JSON Format
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
