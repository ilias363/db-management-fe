"use server";

import { revalidatePath } from "next/cache";
import { IndexMetadataDto } from "@/lib/types/database";
import { ActionState } from "@/lib/types";
import { withAuth } from "@/lib/auth";
import { apiClient } from "@/lib/api-client";
import { CreateIndexSchema, createIndexSchema } from "@/lib/schemas/database";
import { HttpError } from "@/lib/errors";
import z from "zod";

export async function createIndex(
    prevState: ActionState<IndexMetadataDto> | undefined,
    formData: CreateIndexSchema
): Promise<ActionState<IndexMetadataDto>> {
    const authAction = await withAuth(
        async (
            prevState: ActionState<IndexMetadataDto> | undefined,
            formData: CreateIndexSchema
        ): Promise<ActionState<IndexMetadataDto>> => {
            const result = createIndexSchema.safeParse(formData);

            if (!result.success) {
                return {
                    success: false,
                    message: "Please correct the validation errors",
                    errors: z.flattenError(result.error).fieldErrors,
                };
            }

            try {
                const response = await apiClient.index.createIndex(result.data);

                if (!response.success) {
                    return {
                        success: false,
                        errors: { root: response.message.split("\n") },
                    };
                }

                revalidatePath(`/database/tables/${result.data.schemaName}/${result.data.tableName}`);
                revalidatePath(`/database/tables`);

                return {
                    success: true,
                    message: `Index "${result.data.indexName}" created successfully on table "${result.data.tableName}"`,
                    data: response.data,
                };
            } catch (error) {
                if (error instanceof HttpError) {
                    return {
                        success: false,
                        message: "Index creation failed",
                        errors: {
                            root: [error.message || "Server error occurred"],
                        },
                    };
                }

                return {
                    success: false,
                    message: "Index creation failed",
                    errors: {
                        root: ["An unexpected error occurred. Please try again."],
                    },
                };
            }
        }
    );

    return authAction(prevState, formData);
}

export async function deleteIndex(
    schemaName: string,
    tableName: string,
    indexName: string
): Promise<ActionState<void>> {
    const authAction = await withAuth(async (): Promise<ActionState<void>> => {
        try {
            const response = await apiClient.index.deleteIndex(schemaName, tableName, indexName);

            if (!response.success) {
                return {
                    success: false,
                    message: response.message || "Failed to delete index",
                };
            }

            revalidatePath(`/database/tables/${schemaName}/${tableName}`);
            revalidatePath(`/database/tables`);

            return {
                success: true,
                message: `Index "${indexName}" deleted successfully`,
            };
        } catch (error) {
            if (error instanceof HttpError) {
                return {
                    success: false,
                    message: error.message || "Failed to delete index",
                };
            }

            return {
                success: false,
                message: "An unexpected error occurred while deleting the index",
            };
        }
    });

    return authAction();
}
