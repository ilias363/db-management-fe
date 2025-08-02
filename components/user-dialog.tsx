"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserDto, RoleDto } from "@/lib/types";
import { useActionState } from "react";
import { createUser, updateUser } from "@/lib/actions/user";
import { useFormStatus } from "react-dom";
import ErrorMessage from "./error-message";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDto | null;
  roles: RoleDto[];
  isCreateMode: boolean;
  onSuccess: () => void;
}

export function UserDialog({
  open,
  onOpenChange,
  user,
  roles,
  isCreateMode,
  onSuccess,
}: UserDialogProps) {
  const isSystemAdmin = user?.roles?.some(role => role.name.toUpperCase() === "ADMIN");

  const actionFn = isCreateMode ? createUser : updateUser;

  const [state, action] = useActionState(actionFn, undefined);

  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
      onSuccess();
    }
  }, [state, onOpenChange, onSuccess]);

  function getFieldErrors(field: string): string | string[] | undefined {
    if (state?.errors && typeof state.errors === "object" && field in state.errors) {
      return state.errors[field as keyof typeof state.errors];
    }
    return undefined;
  }

  function getGeneralErrors(): string | string[] | undefined {
    if (state?.errors && typeof state.errors === "object" && "general" in state.errors) {
      return state.errors["general"];
    }
    return undefined;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isCreateMode ? "Create New User" : `Edit User: ${user?.username}`}
          </DialogTitle>
          <DialogDescription>
            {isCreateMode
              ? "Create a new user account with assigned roles."
              : "Update user information and role assignments."}
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-6">
          {getGeneralErrors() && <ErrorMessage error={getGeneralErrors()} />}
          <div className="grid gap-4">
            {!isCreateMode && (
              <Input id="id" name="id" defaultValue={isCreateMode ? "" : user?.id} hidden />
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                defaultValue={isCreateMode ? "" : user?.username}
                placeholder="Enter username"
                required
                disabled={isSystemAdmin}
                className={getFieldErrors("username") ? "border-red-500" : ""}
              />
              {getFieldErrors("username") && <ErrorMessage error={getFieldErrors("username")} />}
            </div>

            {isCreateMode && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  required
                  className={getFieldErrors("password") ? "border-red-500" : ""}
                />
                {getFieldErrors("password") && <ErrorMessage error={getFieldErrors("password")} />}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                name="active"
                defaultChecked={isCreateMode ? true : user?.active}
                value="true"
                disabled={isSystemAdmin}
              />
              <Label htmlFor="active">Active User</Label>
            </div>
          </div>

          <Card className="py-3">
            <CardHeader>
              <CardTitle className="text-lg">Role Assignment</CardTitle>
              <CardDescription>
                Select the roles to assign to this user. Roles determine what actions the user can
                perform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 max-h-48 overflow-y-auto pr-2">
                {roles
                  .sort((r1, r2) => r1.id - r2.id)
                  .map(role => {
                    const isSystemRole =
                      role.name.toUpperCase() === "ADMIN" || role.name.toUpperCase() === "VIEWER";
                    const isCurrentlyAdmin = role.name.toUpperCase() === "ADMIN" && isSystemAdmin;

                    return (
                      <div
                        key={role.id}
                        className="flex items-center space-x-3 p-2 border rounded-lg"
                      >
                        <Checkbox
                          id={`role-${role.id}`}
                          name="roleIds"
                          value={role.id}
                          defaultChecked={user?.roles?.some(r => r.id === role.id)}
                          disabled={isCurrentlyAdmin}
                        />
                        <div className="grid gap-1.5 leading-none flex-1">
                          <label
                            htmlFor={`role-${role.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                          >
                            {role.name}
                            {isSystemRole && (
                              <span className="text-xs bg-muted px-2 py-1 rounded-full">
                                System Role
                              </span>
                            )}
                          </label>
                          <p className="text-xs text-muted-foreground">{role.description}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
              {getFieldErrors("roles") && <ErrorMessage error={getFieldErrors("roles")} />}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}
