"use server";

import { revalidatePath } from "next/cache";

import { apiClient } from "../api-client";
import type {
    PaginationParams,
    AuditLogPageDto,
    AuditStats,
} from "../types";
import { HttpError } from "../errors";
import { withAdminAuth } from "../auth";

export interface AuditDataParams extends PaginationParams {
    search?: string;
    userId?: number;
    actionType?: string;
    successful?: boolean;
    after?: Date;
    before?: Date;
}

export interface AuditDataResponse {
    success: boolean;
    data?: {
        audits?: AuditLogPageDto | null;
        stats?: AuditStats | null;
    };
    message?: string;
}

export interface DeleteAuditLogResponse {
    success: boolean;
    message: string;
}

export async function getAuditData(params: AuditDataParams = {}): Promise<AuditDataResponse> {
    const authAction = await withAdminAuth(async (params: AuditDataParams = {}): Promise<AuditDataResponse> => {
        try {
            const queryParams: Record<string, string> = {
                page: (params.page || 0).toString(),
                size: (params.size || 10).toString(),
                sortBy: params.sortBy || "auditTimestamp",
                sortDirection: params.sortDirection || "DESC",
            };

            if (params.search) {
                queryParams.search = params.search;
            }
            if (params.userId) {
                queryParams.userId = params.userId.toString();
            }
            if (params.actionType) {
                queryParams.actionType = params.actionType;
            }
            if (params.successful !== undefined) {
                queryParams.successful = params.successful.toString();
            }

            if (params.after) {
                queryParams.after = params.after.toISOString();
            }

            if (params.before) {
                queryParams.before = params.before.toISOString();
            }

            const [auditResponse, statsResponse] = await Promise.all([
                apiClient.audit.getAuditLogs(queryParams),
                apiClient.audit.getAuditStats()
            ]);

            return {
                success: true,
                data: {
                    audits: auditResponse.success ? auditResponse.data : null,
                    stats: statsResponse.success ? statsResponse.data : null,
                },
            };
        } catch (error) {
            console.error("Error fetching audit data:", error);
            return {
                success: false,
                message: "An unexpected error occurred while fetching audit data",
            };
        }
    });

    return authAction(params);
}

export async function deleteAuditLog(id: number): Promise<DeleteAuditLogResponse> {
    const authAction = await withAdminAuth(async (id: number): Promise<DeleteAuditLogResponse> => {
        try {
            const response = await apiClient.audit.deleteAuditLog(id);

            if (response.success) {
                revalidatePath("/admin/audit");
                return {
                    success: true,
                    message: "Audit log deleted successfully",
                };
            }

            return {
                success: false,
                message: response.message || "Failed to delete audit log",
            };
        } catch (error) {
            if (error instanceof HttpError) {
                return {
                    success: false,
                    message: error.message,
                };
            }

            console.error("Error deleting audit log:", error);
            return {
                success: false,
                message: "An unexpected error occurred while deleting the audit log",
            };
        }
    });

    return authAction(id);
}
