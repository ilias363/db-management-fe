"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserDto, RoleDto } from "@/lib/types";
import { ConfirmDialog } from "@/components/common";
import { useUserForm } from "@/lib/hooks";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

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
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const { form, isPending, submitError, submitUser, resetForm, isDirty, errors } = useUserForm(
    isCreateMode,
    user || undefined,
    () => {
      onSuccess();
      onOpenChange(false);
    },
    (error: string) => {
      toast.error(error);
    }
  );

  const isSystemAdmin = user?.roles?.some(role => role.name.toUpperCase() === "ADMIN");

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleClose = () => {
    if (isDirty && !isPending) {
      setShowDiscardDialog(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleDiscardChanges = () => {
    setShowDiscardDialog(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitUser)} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {(errors.root?.message || submitError) && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.root?.message || submitError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter username"
                            {...field}
                            disabled={isPending || isSystemAdmin}
                          />
                        </FormControl>
                        <FormDescription>
                          {isSystemAdmin
                            ? "System admin username cannot be modified"
                            : "Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isCreateMode && (
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password *</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter password"
                              {...field}
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormDescription>
                            Password must be at least 8 characters long
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isPending || isSystemAdmin}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Active User</FormLabel>
                          <FormDescription>
                            {isSystemAdmin
                              ? "System admin status cannot be changed"
                              : "Inactive users cannot log into the system"}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Role Assignment</CardTitle>
                    <CardDescription>
                      Select the roles to assign to this user. Roles determine what actions the user
                      can perform.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="roles"
                      render={() => (
                        <FormItem>
                          <div className="grid gap-2">
                            {roles
                              .sort((r1, r2) => r1.id - r2.id)
                              .map(role => {
                                const isSystemRole =
                                  role.name.toUpperCase() === "ADMIN" ||
                                  role.name.toUpperCase() === "VIEWER";
                                const isCurrentlyAdmin =
                                  role.name.toUpperCase() === "ADMIN" && isSystemAdmin;

                                return (
                                  <FormField
                                    key={role.id}
                                    control={form.control}
                                    name="roles"
                                    render={({ field }) => {
                                      const isSelected = field.value?.includes(role.id) || false;
                                      return (
                                        <FormItem
                                          key={role.id}
                                          className="flex flex-row items-center space-x-2 space-y-0 p-2 border rounded-lg"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={isSelected}
                                              onCheckedChange={checked => {
                                                const updatedRoles = checked
                                                  ? [...(field.value || []), role.id]
                                                  : (field.value || []).filter(
                                                      value => value !== role.id
                                                    );
                                                field.onChange(updatedRoles);
                                              }}
                                              disabled={isPending || isCurrentlyAdmin}
                                            />
                                          </FormControl>
                                          <div className="grid gap-1.5 leading-none flex-1">
                                            <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                                              {role.name}
                                              {isSystemRole && (
                                                <span className="text-xs bg-muted px-2 py-1 rounded-full">
                                                  System Role
                                                </span>
                                              )}
                                            </FormLabel>
                                            <FormDescription className="text-xs">
                                              {role.description || "No description"}
                                            </FormDescription>
                                          </div>
                                        </FormItem>
                                      );
                                    }}
                                  />
                                );
                              })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              <DialogFooter className="gap-2 flex-shrink-0 border-t pt-4 mt-4">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : isCreateMode ? "Create User" : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to close this dialog? All changes will be lost."
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        onConfirm={handleDiscardChanges}
        confirmText="Discard Changes"
        cancelText="Continue Editing"
        variant="destructive"
      />
    </>
  );
}
