"use client";

import { useState, useEffect } from "react";
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
import { ErrorMessage } from "@/components/common";
import { ConfirmDialog } from "@/components/common";
import { useCreateSchemaForm } from "@/lib/hooks";

interface SchemaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateSchemaDialog({ open, onOpenChange, onSuccess }: SchemaDialogProps) {
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const { form, isPending, submitError, submitSchema, resetForm, isDirty } = useCreateSchemaForm(
    () => {
      onOpenChange(false);
      onSuccess();
    },
    (error: string) => {
      toast.error(error);
    }
  );

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Schema</DialogTitle>
            <DialogDescription>
              Create a new database schema to organize your tables and views.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitSchema)} className="space-y-6">
              {submitError && <ErrorMessage error={submitError} />}

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="schemaName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schema Name *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter schema name"
                          disabled={isPending}
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Schema name must start with a letter and contain only letters, numbers, and
                        underscores.
                      </p>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending || !form.watch("schemaName")?.trim()}>
                  {isPending ? "Creating..." : "Create Schema"}
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
