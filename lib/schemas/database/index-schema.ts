import { z } from "zod";
import { IndexType, SortDirection } from "@/lib/types";

const namePattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;

export const indexColumnSchema = z.object({
    columnName: z
        .string()
        .min(1, "Column name cannot be blank")
        .regex(
            namePattern,
            "Column name must start with a letter and contain only alphanumeric characters and underscores"
        ),
    sortOrder: z.enum(SortDirection).optional(),
});

export const createIndexSchema = z
    .object({
        indexName: z
            .string()
            .min(1, "Index name cannot be blank")
            .regex(
                namePattern,
                "Index name must start with a letter and contain only alphanumeric characters and underscores"
            ),
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
        indexType: z.nativeEnum(IndexType),
        isUnique: z.boolean().optional(),
        indexColumns: z
            .array(indexColumnSchema)
            .min(1, "At least one column must be selected for the index"),
    })
    .refine(
        data => {
            const columnNames = data.indexColumns.map(col => col.columnName);
            const uniqueNames = new Set(columnNames);
            return columnNames.length === uniqueNames.size;
        },
        {
            message: "All selected columns must be unique within the index",
            path: ["indexColumns"],
        }
    );

export type CreateIndexSchema = z.infer<typeof createIndexSchema>;
export type IndexColumnSchema = z.infer<typeof indexColumnSchema>;
