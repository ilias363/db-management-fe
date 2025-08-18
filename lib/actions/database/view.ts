"use server";

import { apiClient } from "@/lib/api-client";
import { withAuth } from "@/lib/auth";
import { ViewListDto, ViewMetadataDto } from "@/lib/types/database";

export async function getAllViewsInSchema(schemaName: string): Promise<ViewListDto | null> {
    const authAction = await withAuth(async (): Promise<ViewListDto | null> => {
        try {
            const response = await apiClient.view.getAllViewsInSchema(schemaName);
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error("Failed to get views:", error);
            return null;
        }
    });

    return authAction();
}

export async function getView(
    schemaName: string,
    viewName: string
): Promise<ViewMetadataDto | null> {
    const authAction = await withAuth(async (): Promise<ViewMetadataDto | null> => {
        try {
            const response = await apiClient.view.getView(schemaName, viewName);
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error("Failed to get view:", error);
            return null;
        }
    });

    return authAction();
}
