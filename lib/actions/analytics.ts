"use server";

import { apiClient } from "../api-client";
import { withAuth } from "../auth";
import { DatabaseStats } from "../types";

export async function getDatabaseStats(includeSystem: boolean): Promise<DatabaseStats | null> {
    const authAction = await withAuth(async (): Promise<DatabaseStats | null> => {
        try {
            const response = await apiClient.analytics.getDatabaseStats(includeSystem);
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