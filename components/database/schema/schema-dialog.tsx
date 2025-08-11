"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useActionState } from "react";
import { createSchema } from "@/lib/actions/database";
import { ErrorMessage } from "@/components/common";
import { ConfirmDialog } from "@/components/common";
import { getStateFieldErrors, getStateGeneralErrors } from "@/lib/utils";

interface SchemaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormData {
  schemaName: string;
}

export function SchemaDialog({ open, onOpenChange, onSuccess }: SchemaDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    schemaName: "",
  });

  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const schemaNameInputRef = useRef<HTMLInputElement>(null);

  const [state, action, pending] = useActionState(createSchema, undefined);

  const checkForChanges = useCallback(() => {
    return formData.schemaName !== "";
  }, [formData]);

  useEffect(() => {
    setHasChanges(checkForChanges());
  }, [checkForChanges]);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || "Schema created successfully");
      setHasChanges(false);
      onOpenChange(false);
      onSuccess();
    }
  }, [state, onOpenChange, onSuccess]);

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      const initialData: FormData = {
        schemaName: "",
      };
      setFormData(initialData);
      setHasChanges(false);

      // Auto-focus schema name input
      setTimeout(() => schemaNameInputRef.current?.focus(), 100);
    }
  }, [open]);

  const getFieldErrors = useCallback((field: string) => getStateFieldErrors(field, state), [state]);
  const getGeneralErrors = useCallback(() => getStateGeneralErrors(state), [state]);

  const handleClose = useCallback(() => {
    if (hasChanges) {
      setShowUnsavedWarning(true);
    } else {
      onOpenChange(false);
      if (state?.errors) state.errors = undefined;
    }
  }, [hasChanges, onOpenChange, state]);

  const handleForceClose = useCallback(() => {
    setShowUnsavedWarning(false);
    setHasChanges(false);
    onOpenChange(false);
    if (state?.errors) state.errors = undefined;
  }, [onOpenChange, state]);

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Schema</DialogTitle>
            <DialogDescription>
              Create a new database schema to organize your tables and views.
            </DialogDescription>
          </DialogHeader>

          <form action={action} className="space-y-6">
            {getGeneralErrors() && <ErrorMessage error={getGeneralErrors()} />}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schemaName">Schema Name *</Label>
                <Input
                  ref={schemaNameInputRef}
                  id="schemaName"
                  name="schemaName"
                  value={formData.schemaName}
                  onChange={e => setFormData(prev => ({ ...prev, schemaName: e.target.value }))}
                  placeholder="Enter schema name"
                  required
                  className={getFieldErrors("schemaName") ? "border-red-500" : ""}
                />
                {getFieldErrors("schemaName") && (
                  <ErrorMessage error={getFieldErrors("schemaName")} />
                )}
                <p className="text-xs text-muted-foreground">
                  Schema name must start with a letter and contain only letters, numbers, and
                  underscores.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending || !formData.schemaName.trim()}>
                {pending ? "Creating..." : "Create Schema"}
              </Button>
            </DialogFooter>
          </form>
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
      />
    </>
  );
}
