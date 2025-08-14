import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import type { RoleDto, PermissionDetailDto } from "@/lib/types";
import { ErrorMessage } from "@/components/common";
import { PermissionForm } from "@/components/common";
import { ConfirmDialog } from "@/components/common";
import { PermissionBadge } from "@/components/common";
import { useRoleForm } from "@/lib/hooks";

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleDto | null;
  isCreateMode: boolean;
  onSuccess: () => void;
}

export function RoleDialog({ open, onOpenChange, role, isCreateMode, onSuccess }: RoleDialogProps) {
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const { form, isPending, submitError, submitRole, resetForm, isDirty } = useRoleForm(
    isCreateMode,
    role || undefined,
    () => {
      onOpenChange(false);
      onSuccess();
    },
    (error: string) => {
      toast.error(error);
    }
  );

  const handleAddPermission = (permission: PermissionDetailDto) => {
    const currentPermissions = form.getValues("permissions");
    form.setValue("permissions", [...currentPermissions, permission], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleRemovePermission = useCallback(
    (index: number) => {
      const currentPermissions = form.getValues("permissions");
      const updatedPermissions = currentPermissions.filter((_, i) => i !== index);
      form.setValue("permissions", updatedPermissions, {
        shouldValidate: true,
        shouldDirty: true,
      });
      toast.success("Permission removed");
    },
    [form]
  );

  const hasPermission = useCallback(
    (permission: PermissionDetailDto) => {
      const currentPermissions = form.getValues("permissions");
      return currentPermissions.some(
        p =>
          p.schemaName === permission.schemaName &&
          p.tableName === permission.tableName &&
          p.viewName === permission.viewName &&
          p.permissionType === permission.permissionType
      );
    },
    [form]
  );

  const handleClose = () => {
    if (isDirty) {
      setShowUnsavedWarning(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleForceClose = () => {
    setShowUnsavedWarning(false);
    onOpenChange(false);
    resetForm();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="lg:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreateMode ? "Create New Role" : `Edit Role: ${role?.name}`}
            </DialogTitle>
            <DialogDescription>
              {isCreateMode
                ? "Create a new role with specific permissions."
                : "Modify the role details and permissions."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitRole)} className="space-y-6">
              {submitError && <ErrorMessage error={submitError} />}

              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter role name"
                          disabled={role?.isSystemRole || isPending}
                          autoFocus={isCreateMode}
                        />
                      </FormControl>
                      <FormMessage />
                      {role?.isSystemRole && (
                        <p className="text-xs text-muted-foreground">
                          System role names cannot be modified
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          placeholder="Enter role description (optional)"
                          rows={3}
                          disabled={isPending}
                          className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm min-h-[60px] resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="permissions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permissions</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <PermissionForm
                          onAddPermission={handleAddPermission}
                          hasPermission={hasPermission}
                        />

                        {field.value.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium">
                              Current Permissions ({field.value.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {field.value.map((permission, index: number) => (
                                <PermissionBadge
                                  key={index}
                                  permission={{
                                    ...permission,
                                    schemaName: permission.schemaName ?? null,
                                    tableName: permission.tableName ?? null,
                                    viewName: permission.viewName ?? null,
                                  }}
                                  onRemove={() => handleRemovePermission(index)}
                                  showRemove={true}
                                  variant="secondary"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {field.value.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No permissions added yet</p>
                            <p className="text-sm">Add permissions using the form above</p>
                          </div>
                        )}
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || form.getValues("permissions").length === 0}
                >
                  {isPending ? "Saving..." : isCreateMode ? "Create Role" : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to close this dialog? All changes will be lost."
        open={showUnsavedWarning}
        onOpenChange={setShowUnsavedWarning}
        onConfirm={handleForceClose}
        confirmText="Discard Changes"
        cancelText="Continue Editing"
        variant="destructive"
      />
    </>
  );
}
