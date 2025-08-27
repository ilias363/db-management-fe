import { ApiResponse } from "./common";

export type ExportFormat = 'csv' | 'json';

export enum ExportJobStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export interface ExportJobDto {
    id: string;
    resource: string; // users, roles, audits, or table/view name
    format: ExportFormat;
    status: ExportJobStatus;
    downloadUrl?: string; // present when COMPLETED
    errorMessage?: string;
    recordCount?: number;
    createdAt: string;
    completedAt?: string;
}

export type ExportJobResponse = ApiResponse<ExportJobDto>;

export interface ExportOptions {
    format?: ExportFormat;
    async?: boolean;
}

export interface DownloadOptions {
    filename?: string;
    contentType?: string;
}

export const EXPORT_FORMATS: Record<ExportFormat, { label: string; extension: string; contentType: string }> = {
    csv: {
        label: 'CSV',
        extension: '.csv',
        contentType: 'text/csv'
    },
    json: {
        label: 'JSON',
        extension: '.json',
        contentType: 'application/json'
    }
};
