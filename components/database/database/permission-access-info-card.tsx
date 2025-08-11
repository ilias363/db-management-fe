"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/stores/auth-store";
import { Shield } from "lucide-react";

export function PermissionAccessInfoCard() {
  const { user } = useAuth();
  const isAdmin = user?.roles?.some(role => role.name === "ADMIN");

  return (
    <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-amber-800 dark:text-amber-200">
            Permission-Based Access
          </CardTitle>
        </div>
        <CardDescription className="text-amber-700 dark:text-amber-300">
          Your access to database operations is controlled by your assigned permissions. You can
          only view and modify databases, schemas, tables, and data that you have explicit
          permissions for.
          {isAdmin && " As an admin, you have elevated access to system functions."}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
