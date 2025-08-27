"use server";

import { withAdminAuth } from "../auth";
import { apiClient } from "../api-client";
import { ExportFormat } from "../types";
import { HttpError } from "../errors";

export interface ExportFileData {
    fileData: string; // base64
    filename: string;
    contentType: string;
    size: number;
}

export interface ExportFileResponse {
    success: boolean;
    data?: ExportFileData;
    message?: string;
}

function buildFilename(resource: string, format: ExportFormat) {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    return `${resource}-export-${ts}.${format}`;
}

async function processResponse(
    res: Response,
    resource: string,
    format: ExportFormat
): Promise<ExportFileResponse> {
    try {
        const arrayBuffer = await res.arrayBuffer();
        const size = arrayBuffer.byteLength;
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const contentType = format === "csv" ? "text/csv" : "application/json";
        return {
            success: true,
            data: {
                fileData: base64,
                filename: buildFilename(resource, format),
                contentType,
                size,
            },
        };
    } catch (e) {
        return {
            success: false,
            message: e instanceof Error ? e.message : "Failed to read export data",
        };
    }
}

export async function exportUsersAction(format: ExportFormat = "csv"): Promise<ExportFileResponse> {
    const authAction = await withAdminAuth(
        async (format: ExportFormat): Promise<ExportFileResponse> => {
            try {
                const res = await apiClient.export.exportUsers(format);
                return processResponse(res, "users", format);
            } catch (e) {
                if (e instanceof HttpError) return { success: false, message: e.message };
                return { success: false, message: "Failed to export users" };
            }
        }
    );
    return authAction(format);
}

export async function exportRolesAction(format: ExportFormat = "csv"): Promise<ExportFileResponse> {
    const authAction = await withAdminAuth(
        async (format: ExportFormat): Promise<ExportFileResponse> => {
            try {
                const res = await apiClient.export.exportRoles(format);
                return processResponse(res, "roles", format);
            } catch (e) {
                if (e instanceof HttpError) return { success: false, message: e.message };
                return { success: false, message: "Failed to export roles" };
            }
        }
    );
    return authAction(format);
}

export async function exportAuditsAction(
    format: ExportFormat = "csv"
): Promise<ExportFileResponse> {
    const authAction = await withAdminAuth(
        async (format: ExportFormat): Promise<ExportFileResponse> => {
            try {
                const res = await apiClient.export.exportAudits(format);
                return processResponse(res, "audit-logs", format);
            } catch (e) {
                if (e instanceof HttpError) return { success: false, message: e.message };
                return { success: false, message: "Failed to export audit logs" };
            }
        }
    );
    return authAction(format);
}
