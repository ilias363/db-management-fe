"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { withAuth } from "@/lib/auth";
import { apiClient } from "@/lib/api-client";
import { HttpError } from "@/lib/errors";
import { ActionState } from "@/lib/types";
import { BaseTableColumnMetadataDto, NewForeignKeyColumnDto, NewPrimaryKeyColumnDto, NewStandardColumnDto } from "@/lib/types/database";
import {
    standardColumnSchema,
    primaryKeyColumnSchema,
    foreignKeyColumnSchema,
} from "@/lib/schemas/database";

// Types with schema and table name for standalone column creation
type StandaloneStandardColumnData = NewStandardColumnDto;

type StandalonePrimaryKeyColumnData = NewPrimaryKeyColumnDto;

type StandaloneForeignKeyColumnData = NewForeignKeyColumnDto;

// Schema validation for schema and table name
const schemaTableValidation = z.object({
    schemaName: z
        .string()
        .min(1, "Schema name cannot be blank")
        .regex(
            /^[a-zA-Z][a-zA-Z0-9_]*$/,
            "Schema name must start with a letter and contain only alphanumeric characters and underscores"
        ),
    tableName: z
        .string()
        .min(1, "Table name cannot be blank")
        .regex(
            /^[a-zA-Z][a-zA-Z0-9_]*$/,
            "Table name must start with a letter and contain only alphanumeric characters and underscores"
        ),
});

export async function createStandardColumn(
    prevState: ActionState<BaseTableColumnMetadataDto> | undefined,
    formData: StandaloneStandardColumnData
): Promise<ActionState<BaseTableColumnMetadataDto>> {
    const authAction = await withAuth(
        async (
            prevState: ActionState<BaseTableColumnMetadataDto> | undefined,
            formData: StandaloneStandardColumnData
        ): Promise<ActionState<BaseTableColumnMetadataDto>> => {
            const schemaTableResult = schemaTableValidation.safeParse(formData);

            if (!schemaTableResult.success) {
                return {
                    success: false,
                    message: "Please correct the validation errors",
                    errors: z.flattenError(schemaTableResult.error).fieldErrors,
                };
            }

            const columnResult = standardColumnSchema.safeParse(formData);

            if (!columnResult.success) {
                return {
                    success: false,
                    message: "Please correct the validation errors",
                    errors: z.flattenError(columnResult.error).fieldErrors,
                };
            }

            try {
                const response = await apiClient.column.createStandardColumn(formData);

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
                    message: `Standard column "${formData.columnName}" created successfully`,
                    data: response.data,
                };
            } catch (error) {
                if (error instanceof HttpError) {
                    return {
                        success: false,
                        message: "Column creation failed",
                        errors: {
                            root: [error.message || "Server error occurred"],
                        },
                    };
                }

                return {
                    success: false,
                    message: "Column creation failed",
                    errors: {
                        root: ["An unexpected error occurred. Please try again."],
                    },
                };
            }
        }
    );

    return authAction(prevState, formData);
}

export async function createPrimaryKeyColumn(
    prevState: ActionState<BaseTableColumnMetadataDto> | undefined,
    formData: StandalonePrimaryKeyColumnData
): Promise<ActionState<BaseTableColumnMetadataDto>> {
    const authAction = await withAuth(
        async (
            prevState: ActionState<BaseTableColumnMetadataDto> | undefined,
            formData: StandalonePrimaryKeyColumnData
        ): Promise<ActionState<BaseTableColumnMetadataDto>> => {
            const schemaTableResult = schemaTableValidation.safeParse(formData);

            if (!schemaTableResult.success) {
                return {
                    success: false,
                    message: "Please correct the validation errors",
                    errors: z.flattenError(schemaTableResult.error).fieldErrors,
                };
            }

            const columnResult = primaryKeyColumnSchema.safeParse(formData);

            if (!columnResult.success) {
                return {
                    success: false,
                    message: "Please correct the validation errors",
                    errors: z.flattenError(columnResult.error).fieldErrors,
                };
            }

            try {
                const response = await apiClient.column.createPrimaryKeyColumn(formData);

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
                    message: `Primary key column "${formData.columnName}" created successfully`,
                    data: response.data,
                };
            } catch (error) {
                if (error instanceof HttpError) {
                    return {
                        success: false,
                        message: "Column creation failed",
                        errors: {
                            root: [error.message || "Server error occurred"],
                        },
                    };
                }

                return {
                    success: false,
                    message: "Column creation failed",
                    errors: {
                        root: ["An unexpected error occurred. Please try again."],
                    },
                };
            }
        }
    );

    return authAction(prevState, formData);
}

export async function createForeignKeyColumn(
    prevState: ActionState<BaseTableColumnMetadataDto> | undefined,
    formData: StandaloneForeignKeyColumnData
): Promise<ActionState<BaseTableColumnMetadataDto>> {
    const authAction = await withAuth(
        async (
            prevState: ActionState<BaseTableColumnMetadataDto> | undefined,
            formData: StandaloneForeignKeyColumnData
        ): Promise<ActionState<BaseTableColumnMetadataDto>> => {
            const schemaTableResult = schemaTableValidation.safeParse(formData);

            if (!schemaTableResult.success) {
                return {
                    success: false,
                    message: "Please correct the validation errors",
                    errors: z.flattenError(schemaTableResult.error).fieldErrors,
                };
            }

            const columnResult = foreignKeyColumnSchema.safeParse(formData);

            if (!columnResult.success) {
                return {
                    success: false,
                    message: "Please correct the validation errors",
                    errors: z.flattenError(columnResult.error).fieldErrors,
                };
            }

            try {
                const response = await apiClient.column.createForeignKeyColumn(formData);

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
                    message: `Foreign key column "${formData.columnName}" created successfully`,
                    data: response.data,
                };
            } catch (error) {
                if (error instanceof HttpError) {
                    return {
                        success: false,
                        message: "Column creation failed",
                        errors: {
                            root: [error.message || "Server error occurred"],
                        },
                    };
                }

                return {
                    success: false,
                    message: "Column creation failed",
                    errors: {
                        root: ["An unexpected error occurred. Please try again."],
                    },
                };
            }
        }
    );

    return authAction(prevState, formData);
}
