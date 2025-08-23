import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  description: string;
  open: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  children?: React.ReactNode;
  confirmDisabled?: boolean;
  preventClose?: boolean;
}

export function ConfirmDialog({
  title,
  description,
  open,
  onConfirm,
  onOpenChange,
  confirmText = "Continue",
  cancelText = "Cancel",
  variant = "default",
  children,
  confirmDisabled = false,
  preventClose = false,
}: ConfirmDialogProps) {
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && preventClose) {
      return;
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {variant === "destructive" && <AlertTriangle className="h-5 w-5 text-destructive" />}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">{description}</AlertDialogDescription>
          {children && <div className="mt-4">{children}</div>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => handleOpenChange(false)} disabled={preventClose}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={
              variant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
                : "disabled:opacity-50 disabled:cursor-not-allowed"
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
