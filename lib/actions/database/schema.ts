"use server";

import { apiClient } from "@/lib/api-client";
import { withAuth } from "@/lib/auth";
import { SchemaListDto, SchemaMetadataDto } from "@/lib/types/database";
import { ActionState } from "@/lib/types";
import { CreateSchemaSchema, createSchemaSchema } from "@/lib/schemas/database";
import z from "zod";
import { HttpError } from "@/lib/errors";

export interface DeleteSchemaResponse {
    success: boolean;
    message: string;
}

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

export async function createSchema(prevState: ActionState<SchemaMetadataDto> | undefined, formData: CreateSchemaSchema): Promise<ActionState<SchemaMetadataDto>> {
    const authAction = await withAuth(async (prevState: ActionState<SchemaMetadataDto> | undefined, formData: CreateSchemaSchema): Promise<ActionState<SchemaMetadataDto>> => {
        const result = createSchemaSchema.safeParse(formData);

        if (!result.success) {
            return {
                success: false,
                errors: z.flattenError(result.error).fieldErrors,
            };
        }

        try {
            const response = await apiClient.schema.createSchema(formData);
            if (!response.success) {
                return {
                    success: false,
                    errors: { root: response.message.split('\n') },
                };
            }

            return {
                success: true,
                message: "Schema created successfully",
                data: response.data,
            };
        } catch (error) {
            if (error instanceof HttpError) {
                return {
                    success: false,
                    errors: { root: [error.message] },
                };
            }
            console.error('Failed to create schema:', error);
            return {
                success: false,
                errors: { root: ["An unexpected error occurred while creating the schema."] }
            };
        }
    });

    return authAction(prevState, formData);
}

export async function deleteSchema(schemaName: string): Promise<DeleteSchemaResponse> {
    const authAction = await withAuth(async (schemaName: string): Promise<DeleteSchemaResponse> => {
        try {
            const response = await apiClient.schema.deleteSchema(schemaName);
            if (!response.success) {
                return {
                    success: false,
                    message: response.message || "Failed to delete schema"
                };
            }
            return {
                success: true,
                message: "Schema deleted successfully"
            };
        } catch (error) {
            if (error instanceof HttpError) {
                return {
                    success: false,
                    message: error.message
                };
            }
            console.error('Failed to delete schema:', error);
            return {
                success: false,
                message: "An unexpected error occurred while deleting the schema."
            };
        }
    });

    return authAction(schemaName);
}
