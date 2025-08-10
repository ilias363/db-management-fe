"use server";

import { apiClient } from "@/lib/api-client";
import { withAuth } from "../auth-utils";
import { SchemaListDto, SchemaMetadataDto } from "@/lib/types/database";

export async function getAllSchemas(includeSystem: boolean): Promise<SchemaListDto | null> {
    const authAction = await withAuth(async (): Promise<SchemaListDto | null> => {
        try {
            const response = await apiClient.schema.getAllSchemas(includeSystem);
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error('Failed to get schemas:', error);
            return null;
        }
    });

    return authAction();
}

export async function getSchema(schemaName: string): Promise<SchemaMetadataDto | null> {
    const authAction = await withAuth(async (): Promise<SchemaMetadataDto | null> => {
        try {
            const response = await apiClient.schema.getSchemaByName(schemaName);
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error('Failed to get schema:', error);
            return null;
        }
    });

    return authAction();
}
