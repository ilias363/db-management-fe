import { z } from "zod";
import {
    foreignKeyColumnSchema,
    primaryKeyColumnSchema,
    primaryKeyForeignKeyColumnSchema,
    standardColumnSchema,
} from "./column";

const namePattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;

export const createTableSchema = z
    .object({
        schemaName: z
            .string()
            .min(1, "Schema name cannot be blank")
            .regex(
                namePattern,
                "Schema name must start with a letter and contain only alphanumeric characters and underscores"
            ),
        tableName: z
            .string()
            .min(1, "Table name cannot be blank")
            .regex(
                namePattern,
                "Table name must start with a letter and contain only alphanumeric characters and underscores"
            ),

        standardColumns: z.array(standardColumnSchema).default([]),
        primaryKeyColumns: z.array(primaryKeyColumnSchema).default([]),
        foreignKeyColumns: z.array(foreignKeyColumnSchema).default([]),
        primaryKeyForeignKeyColumns: z.array(primaryKeyForeignKeyColumnSchema).default([]),
    })
    .refine(
        data => {
            const totalColumns =
                data.standardColumns.length +
                data.primaryKeyColumns.length +
                data.foreignKeyColumns.length +
                data.primaryKeyForeignKeyColumns.length;

            return totalColumns > 0;
        },
        {
            message: "At least one column is required",
            path: ["tableName"],
        }
    )
    .refine(
        data => {
            const allColumnNames = [
                ...data.standardColumns.map(col => col.columnName),
                ...data.primaryKeyColumns.map(col => col.columnName),
                ...data.foreignKeyColumns.map(col => col.columnName),
                ...data.primaryKeyForeignKeyColumns.map(col => col.columnName),
            ];

            const uniqueNames = new Set(allColumnNames);
            return allColumnNames.length === uniqueNames.size;
        },
        {
            message: "Column names must be unique within the table",
            path: ["standardColumns"],
        }
    )
    .refine(
        data => {
            const totalPrimaryKeys =
                data.primaryKeyColumns.length + data.primaryKeyForeignKeyColumns.length;

            if (totalPrimaryKeys > 1) {
                const hasAutoIncrement = data.primaryKeyColumns.some(col => col.autoIncrement);
                if (hasAutoIncrement) {
                    return false;
                }
            }

            return true;
        },
        {
            message: "Auto-increment can only be used with single primary key columns",
            path: ["primaryKeyColumns"],
        }
    );

export type CreateTableSchema = z.infer<typeof createTableSchema>;
