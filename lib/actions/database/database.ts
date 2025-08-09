"use server";

import { apiClient } from "@/lib/api-client";
import { withAuth } from "../auth-utils";
import { DatabaseStats } from "@/lib/types/database";

export async function getDatabaseStats(includeSystem: boolean): Promise<DatabaseStats | null> {
    const authAction = await withAuth(async (): Promise<DatabaseStats | null> => {
        try {
            const response = await apiClient.database.getDatabaseStats(includeSystem);
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error('Failed to get database stats:', error);
            return null;
        }
    });

    return authAction();
}
