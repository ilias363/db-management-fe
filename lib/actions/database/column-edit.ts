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
    UpdateColumnPrimaryKeySchema,
    updateColumnPrimaryKeySchema,
    UpdateColumnNullableSchema,
    updateColumnNullableSchema,
    UpdateColumnUniqueSchema,
    updateColumnUniqueSchema,
    UpdateColumnDefaultSchema,
    updateColumnDefaultSchema,
    UpdateColumnForeignKeySchema,
    updateColumnForeignKeySchema,
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

export async function updateColumnNullable(
    prevState: ActionState<BaseTableColumnMetadataDto> | undefined,
    formData: UpdateColumnNullableSchema
): Promise<ActionState<BaseTableColumnMetadataDto>> {
    const authAction = await withAuth(async (): Promise<ActionState<BaseTableColumnMetadataDto>> => {
        const result = updateColumnNullableSchema.safeParse(formData);

        if (!result.success) {
            return {
                success: false,
                errors: z.flattenError(result.error).fieldErrors,
            };
        }

        try {
            const response = await apiClient.column.updateColumnNullable(
                {
                    schemaName: formData.schemaName,
                    tableName: formData.tableName,
                    columnName: formData.columnName,
                    isNullable: formData.isNullable,
                },
                formData.populate
            );

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
                message: `Column ${formData.isNullable ? "can now accept" : "no longer accepts"
                    } NULL values`,
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
                    root: ["An unexpected error occurred while updating the column nullable constraint."],
                },
            };
        }
    });

    return authAction();
}

export async function updateColumnUnique(
    prevState: ActionState<BaseTableColumnMetadataDto> | undefined,
    formData: UpdateColumnUniqueSchema
): Promise<ActionState<BaseTableColumnMetadataDto>> {
    const authAction = await withAuth(async (): Promise<ActionState<BaseTableColumnMetadataDto>> => {
        const result = updateColumnUniqueSchema.safeParse(formData);

        if (!result.success) {
            return {
                success: false,
                errors: z.flattenError(result.error).fieldErrors,
            };
        }

        try {
            const response = await apiClient.column.updateColumnUnique(formData);

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
                message: `Column ${formData.isUnique ? "now enforces" : "no longer enforces"
                    } unique constraint`,
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
                    root: ["An unexpected error occurred while updating the column unique constraint."],
                },
            };
        }
    });

    return authAction();
}

export async function updateColumnDefault(
    prevState: ActionState<BaseTableColumnMetadataDto> | undefined,
    formData: UpdateColumnDefaultSchema
): Promise<ActionState<BaseTableColumnMetadataDto>> {
    const authAction = await withAuth(async (): Promise<ActionState<BaseTableColumnMetadataDto>> => {
        const result = updateColumnDefaultSchema.safeParse(formData);

        if (!result.success) {
            return {
                success: false,
                errors: z.flattenError(result.error).fieldErrors,
            };
        }

        try {
            const response = await apiClient.column.updateColumnDefault({
                schemaName: formData.schemaName,
                tableName: formData.tableName,
                columnName: formData.columnName,
                columnDefault: formData.columnDefault || "NULL",
            });

            if (!response.success) {
                return {
                    success: false,
                    errors: { root: response.message.split("\n") },
                };
            }

            revalidatePath(`/database/tables/${formData.schemaName}/${formData.tableName}`);
            revalidatePath(`/database/schemas/${formData.schemaName}`);

            const defaultMsg = formData.columnDefault
                ? `Column default value updated to "${formData.columnDefault}"`
                : "Column default value removed";

            return {
                success: true,
                message: defaultMsg,
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
                errors: { root: ["An unexpected error occurred while updating the column default value."] },
            };
        }
    });

    return authAction();
}

export async function updateColumnPrimaryKey(
    prevState: ActionState<BaseTableColumnMetadataDto> | undefined,
    formData: UpdateColumnPrimaryKeySchema
): Promise<ActionState<BaseTableColumnMetadataDto[]>> {
    const authAction = await withAuth(async (): Promise<ActionState<BaseTableColumnMetadataDto[]>> => {
        const result = updateColumnPrimaryKeySchema.safeParse(formData);

        if (!result.success) {
            return {
                success: false,
                errors: z.flattenError(result.error).fieldErrors,
            };
        }

        try {
            const response = await apiClient.column.updateColumnPrimaryKey({
                schemaName: formData.schemaName,
                tableName: formData.tableName,
                columnNames: formData.columnNames,
                isPrimaryKey: formData.isPrimaryKey,
            }, formData.force);

            if (!response.success) {
                return {
                    success: false,
                    errors: { root: response.message.split("\n") },
                };
            }

            revalidatePath(`/database/tables/${formData.schemaName}/${formData.tableName}`);
            revalidatePath(`/database/schemas/${formData.schemaName}`);

            const actionMsg = formData.isPrimaryKey
                ? `Primary key created with columns: ${formData.columnNames.join(", ")}`
                : "Primary key removed";

            return {
                success: true,
                message: actionMsg,
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
                errors: { root: ["An unexpected error occurred while updating the primary key."] },
            };
        }
    });

    return authAction();
}

export async function updateColumnForeignKey(
    prevState: ActionState<BaseTableColumnMetadataDto> | undefined,
    formData: UpdateColumnForeignKeySchema
): Promise<ActionState<BaseTableColumnMetadataDto>> {
    const authAction = await withAuth(async (): Promise<ActionState<BaseTableColumnMetadataDto>> => {
        const result = updateColumnForeignKeySchema.safeParse(formData);

        if (!result.success) {
            return {
                success: false,
                errors: z.flattenError(result.error).fieldErrors,
            };
        }

        try {
            const response = await apiClient.column.updateColumnForeignKey(formData);

            if (!response.success) {
                return {
                    success: false,
                    errors: { root: response.message.split("\n") },
                };
            }

            revalidatePath(`/database/tables/${formData.schemaName}/${formData.tableName}`);
            revalidatePath(`/database/schemas/${formData.schemaName}`);

            const actionMsg = formData.isForeignKey
                ? `Foreign key constraint created, referencing ${formData.referencedSchemaName}.${formData.referencedTableName}.${formData.referencedColumnName}`
                : "Foreign key constraint removed";

            return {
                success: true,
                message: actionMsg,
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
                errors: { root: ["An unexpected error occurred while updating the foreign key constraint."] },
            };
        }
    });

    return authAction();
}
