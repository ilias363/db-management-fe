"use server";

import { apiClient } from "@/lib/api-client";
import { withAuth } from "@/lib/auth";
import { HttpError } from "@/lib/errors";
import { renameViewSchema, RenameViewSchema } from "@/lib/schemas/database";
import { ActionState } from "@/lib/types";
import { ViewListDto, ViewMetadataDto } from "@/lib/types/database";
import { revalidatePath } from "next/cache";
import z from "zod";

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

export async function renameView(
    prevState: ActionState<ViewMetadataDto> | undefined,
    formData: RenameViewSchema
): Promise<ActionState<ViewMetadataDto>> {
    const authAction = await withAuth(async (): Promise<ActionState<ViewMetadataDto>> => {
        const result = renameViewSchema.safeParse(formData);

        if (!result.success) {
            return {
                success: false,
                errors: z.flattenError(result.error).fieldErrors,
            };
        }

        try {
            const response = await apiClient.view.renameView(formData);
            if (!response.success) {
                return {
                    success: false,
                    errors: { root: response.message.split("\n") },
                };
            }

            revalidatePath(`/database/views`);
            revalidatePath(`/database/schemas/${formData.schemaName}`);

            return {
                success: true,
                message: `View renamed successfully`,
                data: response.data,
            };
        } catch (error) {
            if (error instanceof HttpError) {
                return {
                    success: false,
                    errors: { root: [error.message] },
                };
            }

            return {
                success: false,
                errors: { root: ["An unexpected error occurred while renaming the view."] },
            };
        }
    });

    return authAction();
}

export async function deleteView(schemaName: string, viewName: string): Promise<ActionState<void>> {
    const authAction = await withAuth(async (): Promise<ActionState<void>> => {
        try {
            const response = await apiClient.view.deleteView(schemaName, viewName);

            if (!response.success) {
                return {
                    success: false,
                    message: response.message || "Failed to delete view",
                };
            }

            revalidatePath(`/database/views`);
            revalidatePath(`/database/schemas/${schemaName}`);

            return {
                success: true,
                message: `View "${viewName}" deleted successfully`,
            };
        } catch (error) {
            if (error instanceof HttpError) {
                return {
                    success: false,
                    message: error.message || "Failed to delete view",
                };
            }

            return {
                success: false,
                message: "An unexpected error occurred while deleting the view",
            };
        }
    });

    return authAction();
}
