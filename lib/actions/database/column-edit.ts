"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/lib/api-client";
import { withAuth } from "@/lib/auth";
import { ActionState } from "@/lib/types";
import { HttpError } from "@/lib/errors";
import { BaseTableColumnMetadataDto } from "@/lib/types/database";
import {
    RenameColumnSchema,
    renameColumnSchema,
    UpdateColumnDataTypeSchema,
    updateColumnDataTypeSchema,
    UpdateColumnAutoIncrementSchema,
    updateColumnAutoIncrementSchema,
} from "@/lib/schemas/database/column-edit";
import z from "zod";

export async function renameColumn(
    prevState: ActionState<BaseTableColumnMetadataDto> | undefined,
    formData: RenameColumnSchema
): Promise<ActionState<BaseTableColumnMetadataDto>> {
    const authAction = await withAuth(async (): Promise<ActionState<BaseTableColumnMetadataDto>> => {
        const result = renameColumnSchema.safeParse(formData);

        if (!result.success) {
            return {
                success: false,
                errors: z.flattenError(result.error).fieldErrors,
            };
        }

        try {
            const response = await apiClient.column.renameColumn(result.data);

            if (!response.success) {
                return {
                    success: false,
                    errors: { root: response.message.split("\n") },
                };
            }

            revalidatePath(`/database/tables/${formData.schemaName}/${formData.tableName}`);
            revalidatePath(`/database/schemas/${formData.schemaName}`);

            return {
                success: true,
                message: `Column renamed successfully from "${formData.columnName}" to "${formData.newColumnName}"`,
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
                errors: { root: ["An unexpected error occurred while renaming the column."] },
            };
        }
    });

    return authAction();
}

export async function updateColumnDataType(
    prevState: ActionState<BaseTableColumnMetadataDto> | undefined,
    formData: UpdateColumnDataTypeSchema
): Promise<ActionState<BaseTableColumnMetadataDto>> {
    const authAction = await withAuth(async (): Promise<ActionState<BaseTableColumnMetadataDto>> => {
        const result = updateColumnDataTypeSchema.safeParse(formData);

        if (!result.success) {
            return {
                success: false,
                errors: z.flattenError(result.error).fieldErrors,
            };
        }

        try {
            const response = await apiClient.column.updateColumnDataType(formData);

            if (!response.success) {
                return {
                    success: false,
                    errors: { root: response.message.split("\n") },
                };
            }

            revalidatePath(`/database/tables/${formData.schemaName}/${formData.tableName}`);
            revalidatePath(`/database/schemas/${formData.schemaName}`);

            return {
                success: true,
                message: `Column data type updated successfully to ${formData.dataType}`,
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
                errors: { root: ["An unexpected error occurred while updating the column data type."] },
            };
        }
    });

    return authAction();
}

export async function updateColumnAutoIncrement(
    prevState: ActionState<BaseTableColumnMetadataDto> | undefined,
    formData: UpdateColumnAutoIncrementSchema
): Promise<ActionState<BaseTableColumnMetadataDto>> {
    const authAction = await withAuth(async (): Promise<ActionState<BaseTableColumnMetadataDto>> => {
        const result = updateColumnAutoIncrementSchema.safeParse(formData);

        if (!result.success) {
            return {
                success: false,
                errors: z.flattenError(result.error).fieldErrors,
            };
        }

        try {
            const response = await apiClient.column.updateColumnAutoIncrement(formData);

            if (!response.success) {
                return {
                    success: false,
                    errors: { root: response.message.split("\n") },
                };
            }

            // Revalidate relevant paths
            revalidatePath(`/database/tables/${formData.schemaName}/${formData.tableName}`);
            revalidatePath(`/database/schemas/${formData.schemaName}`);

            return {
                success: true,
                message: `Column auto-increment ${formData.autoIncrement ? "enabled" : "disabled"
                    } successfully`,
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
                errors: {
                    root: ["An unexpected error occurred while updating the column auto-increment."],
                },
            };
        }
    });

    return authAction();
}
