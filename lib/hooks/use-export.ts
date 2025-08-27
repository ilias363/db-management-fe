import { useMutation } from "@tanstack/react-query";
import {
    exportUsersAction,
    exportRolesAction,
    exportAuditsAction,
    type ExportFileResponse,
} from "../actions";
import { ExportFormat } from "../types";
import { toast } from "sonner";

interface ExportParams {
    format: ExportFormat;
}

function triggerDownload(data: ExportFileResponse, label: string, format: ExportFormat) {
    if (!data.success || !data.data) {
        toast.error(`Failed to export ${label}`, { description: data.message });
        return;
    }
    try {
        const link = document.createElement("a");
        link.href = `data:${data.data.contentType};base64,${data.data.fileData}`;
        link.download = data.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`${label} exported (${format.toUpperCase()})`);
    } catch (e) {
        toast.error(`Download failed for ${label}`, {
            description: e instanceof Error ? e.message : undefined,
        });
    }
}

export function useExportUsers() {
    const mutation = useMutation({
        mutationFn: ({ format }: ExportParams) => exportUsersAction(format),
        onSuccess: (data, vars) => triggerDownload(data, "Users", vars.format),
    });
    return {
        exportUsers: (format: ExportFormat) => mutation.mutateAsync({ format }).then(() => { }),
        exporting: mutation.isPending,
    };
}

export function useExportRoles() {
    const mutation = useMutation({
        mutationFn: ({ format }: ExportParams) => exportRolesAction(format),
        onSuccess: (data, vars) => triggerDownload(data, "Roles", vars.format),
    });
    return {
        exportRoles: (format: ExportFormat) => mutation.mutateAsync({ format }).then(() => { }),
        exporting: mutation.isPending,
    };
}

export function useExportAudits() {
    const mutation = useMutation({
        mutationFn: ({ format }: ExportParams) => exportAuditsAction(format),
        onSuccess: (data, vars) => triggerDownload(data, "Audit Logs", vars.format),
    });
    return {
        exportAudits: (format: ExportFormat) => mutation.mutateAsync({ format }).then(() => { }),
        exporting: mutation.isPending,
    };
}
