"use server";

import { revalidatePath } from "next/cache";
import { TableListDto, TableMetadataDto, NewTableDto } from "@/lib/types/database";
import { ActionState } from "@/lib/types";
import { withAuth } from "../auth-utils";
import { apiClient } from "@/lib/api-client";
import { CreateTableSchema, createTableSchema } from "@/lib/schemas/database";
import { HttpError } from "@/lib/errors";
import z from "zod";

export async function getAllTablesInSchema(schemaName: string): Promise<TableListDto | null> {
    const authAction = await withAuth(async (): Promise<TableListDto | null> => {
        try {
            const response = await apiClient.table.getAllTablesInSchema(schemaName);
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error('Failed to get tables:', error);
            return null;
        }
    });

    return authAction();
}

export async function getTable(schemaName: string, tableName: string): Promise<TableMetadataDto | null> {
    const authAction = await withAuth(async (): Promise<TableMetadataDto | null> => {
        try {
            const response = await apiClient.table.getTable(schemaName, tableName);
            if (!response.success || !response.data) {
                return null;
            }
            return response.data;
        } catch (error) {
            console.error('Failed to get table:', error);
            return null;
        }
    });

    return authAction();
}

export async function createTable(prevState: ActionState<TableMetadataDto> | undefined, formData: CreateTableSchema): Promise<ActionState<TableMetadataDto>> {
    const authAction = await withAuth(async (prevState: ActionState<TableMetadataDto> | undefined, formData: CreateTableSchema): Promise<ActionState<TableMetadataDto>> => {
        const result = createTableSchema.safeParse(formData);

        if (!result.success) {
            return {
                success: false,
                errors: z.flattenError(result.error).fieldErrors
            };
        }

        try {
            const newTableDto: NewTableDto = {
                schemaName: result.data.schemaName,
                tableName: result.data.tableName,
                columns: [
                    ...result.data.standardColumns,
                    ...result.data.primaryKeyColumns,
                    ...result.data.foreignKeyColumns,
                    ...result.data.primaryKeyForeignKeyColumns,
                ]
            };

            const response = await apiClient.table.createTable(newTableDto);

            if (!response.success) {
                return {
                    success: false,
                    errors: { general: response.message.split("\n") }
                };
            }

            revalidatePath(`/database/tables`);
            revalidatePath(`/database/schemas/${result.data.schemaName}`);

            return {
                success: true,
                message: "Table created successfully",
                data: response.data
            };
        } catch (error) {
            if (error instanceof HttpError) {
                return {
                    success: false,
                    errors: { general: [error.message] }
                };
            }
            console.error('Unexpected error during table creation:', error);
            return {
                success: false,
                errors: { general: ["An unexpected error occurred"] }
            };
        }
    });

    return authAction(prevState, formData);
}