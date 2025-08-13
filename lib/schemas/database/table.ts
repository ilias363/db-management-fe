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

        standardColumns: z.array(standardColumnSchema),
        primaryKeyColumns: z.array(primaryKeyColumnSchema),
        foreignKeyColumns: z.array(foreignKeyColumnSchema),
        primaryKeyForeignKeyColumns: z.array(primaryKeyForeignKeyColumnSchema),
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
            message: "Table must have at least one column. Please add columns using the tabs above.",
            path: ["root"],
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
            message: "All column names must be unique within the table. Please check for duplicate column names.",
            path: ["root"],
        }
    )
    .refine(
        data => {
            const totalPrimaryKeys =
                data.primaryKeyColumns.length + data.primaryKeyForeignKeyColumns.length;

            return totalPrimaryKeys <= 1 || data.primaryKeyColumns.every(col => !col.autoIncrement);
        },
        {
            message: "Auto-increment can only be used with a single primary key column. Remove auto-increment from composite primary keys.",
            path: ["primaryKeyColumns"],
        }
    );

export type CreateTableSchema = z.infer<typeof createTableSchema>;
