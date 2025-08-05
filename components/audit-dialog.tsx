import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, Target, AlertCircle, CheckCircle2, FileText } from "lucide-react";
import type { AuditLogDto } from "@/lib/types";

interface AuditDialogProps {
  audit: AuditLogDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditDialog({ audit, isOpen, onClose }: AuditDialogProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatActionType = (actionType: string) => {
    return actionType
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!audit) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[60vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Log Details
          </DialogTitle>
          <DialogDescription>Detailed information about audit log #{audit.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    User
                  </div>
                  <div className="font-medium">{audit.user?.username || "unkown"}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Timestamp
                  </div>
                  <div className="font-medium">{formatDate(audit.auditTimestamp)}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    Action Type
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {formatActionType(audit.actionType)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {audit.successful ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    Status
                  </div>
                  <Badge variant={audit.successful ? "default" : "destructive"}>
                    {audit.successful ? "Success" : "Failed"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {(audit.schemaName || audit.tableName || audit.objectName) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Target Object</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {audit.schemaName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Schema:</span>
                    <span className="font-medium">{audit.schemaName}</span>
                  </div>
                )}
                {audit.tableName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Table:</span>
                    <span className="font-medium">{audit.tableName}</span>
                  </div>
                )}
                {audit.objectName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Object:</span>
                    <span className="font-medium">{audit.objectName}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {audit.actionDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Action Details</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap break-all max-w-full overflow-auto">
                  {audit.actionDetails}
                </pre>
              </CardContent>
            </Card>
          )}

          {audit.errorMessage && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-lg text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Error Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 dark:bg-red-800 border border-red-200 rounded-md p-3">
                  <pre className="text-sm text-red-800 dark:text-red-50 whitespace-pre-wrap break-all max-w-full overflow-auto">
                    {audit.errorMessage}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
