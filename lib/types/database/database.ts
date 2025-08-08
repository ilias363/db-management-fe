import { ApiResponse } from "../index";

export interface DatabaseTypeDto {
    type: string;
    displayName: string;
}

export interface DatabaseStats {
    totalSchemas: number;
    totalTables: number;
    totalViews: number;
    totalRecords: number;
}

export type DatabaseTypeResponse = ApiResponse<DatabaseTypeDto>;
export type DatabaseStatsResponse = ApiResponse<DatabaseStats>;