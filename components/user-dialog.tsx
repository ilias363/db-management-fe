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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createUserSchema, updateUserSchema } from "@/lib/schemas";
import type { UserDto, RoleDto, NewUserDto, UpdateUserDto } from "@/lib/types";
import { toast } from "sonner";
import z from "zod";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDto | null;
  roles: RoleDto[];
  isCreateMode: boolean;
  onSave: (userData: NewUserDto | UpdateUserDto) => Promise<void>;
}

export function UserDialog({ open, onOpenChange, user, roles, isCreateMode, onSave }: UserDialogProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    active: true,
    selectedRoles: [] as number[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !isCreateMode) {
      setFormData({
        username: user.username,
        password: "",
        active: user.active,
        selectedRoles: user.roles.map(r => r.id),
      });
    } else if (isCreateMode) {
      setFormData({
        username: "",
        password: "",
        active: true,
        selectedRoles: [],
      });
    }
    setErrors({});
  }, [user, isCreateMode, open]);

  const validateForm = (): boolean => {
    try {
      if (isCreateMode) {
        createUserSchema.parse({
          username: formData.username,
          password: formData.password,
          active: formData.active,
          roles: formData.selectedRoles,
        });
      } else {
        updateUserSchema.parse({
          id: user?.id || 0,
          username: formData.username,
          active: formData.active,
          roles: formData.selectedRoles,
        });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: Record<string, string> = {};
        error.issues.forEach(issue => {
          validationErrors[issue.path[0] as string] = issue.message;
        });
        setErrors(validationErrors);
      }
      return false;
    }
  };

  const handleRoleToggle = (roleId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(roleId)
        ? prev.selectedRoles.filter(id => id !== roleId)
        : [...prev.selectedRoles, roleId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isCreateMode) {
        const newUserData: NewUserDto = {
          username: formData.username,
          password: formData.password,
          active: formData.active,
          roles: formData.selectedRoles,
        };
        await onSave(newUserData);
      } else {
        const updateUserData: UpdateUserDto = {
          id: user!.id,
          username: formData.username,
          active: formData.active,
          roles: formData.selectedRoles,
        };
        await onSave(updateUserData);
      }
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSystemAdmin = user?.roles.some(role => role.name.toUpperCase() === "ADMIN");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isCreateMode ? "Create New User" : `Edit User: ${user?.username}`}</DialogTitle>
          <DialogDescription>
            {isCreateMode
              ? "Create a new user account with assigned roles."
              : "Update user information and role assignments."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter username"
                required
                disabled={isSystemAdmin}
                className={errors.username ? "border-red-500" : ""}
              />
              {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
            </div>

            {isCreateMode && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                  required
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={formData.active}
                onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, active: checked }))}
                disabled={isSystemAdmin}
              />
              <Label htmlFor="active">Active User</Label>
            </div>
          </div>

          <Card className="py-3">
            <CardHeader>
              <CardTitle className="text-lg">Role Assignment</CardTitle>
              <CardDescription>
                Select the roles to assign to this user. Roles determine what actions the user can perform.
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
                      <div key={role.id} className="flex items-center space-x-3 p-2 border rounded-lg">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={formData.selectedRoles.includes(role.id)}
                          onCheckedChange={() => handleRoleToggle(role.id)}
                          disabled={isCurrentlyAdmin}
                        />
                        <div className="grid gap-1.5 leading-none flex-1">
                          <label
                            htmlFor={`role-${role.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                          >
                            {role.name}
                            {isSystemRole && (
                              <span className="text-xs bg-muted px-2 py-1 rounded-full">System Role</span>
                            )}
                          </label>
                          <p className="text-xs text-muted-foreground">{role.description}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
              {errors.roles && <p className="text-sm text-red-500 mt-2">{errors.roles}</p>}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isCreateMode ? "Create User" : "Update User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
