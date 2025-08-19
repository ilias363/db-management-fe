import { DataType } from "@/lib/types";
import { z } from "zod";

const namePattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;

export const renameColumnSchema = z.object({
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
    columnName: z
        .string()
        .min(1, "Column name cannot be blank")
        .regex(
            namePattern,
            "Column name must start with a letter and contain only alphanumeric characters and underscores"
        ),
    newColumnName: z
        .string()
        .min(1, "New column name cannot be blank")
        .regex(
            namePattern,
            "New column name must start with a letter and contain only alphanumeric characters and underscores"
        ),
});

export const updateColumnDataTypeSchema = z
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
        columnName: z
            .string()
            .min(1, "Column name cannot be blank")
            .regex(
                namePattern,
                "Column name must start with a letter and contain only alphanumeric characters and underscores"
            ),
        dataType: z.enum(DataType),
        characterMaxLength: z.number().int().positive().optional(),
        numericPrecision: z.number().int().positive().optional(),
        numericScale: z.number().int().min(0).optional(),
    })
    // Data type validations
    .refine(
        data => {
            if ([DataType.VARCHAR, DataType.CHAR].includes(data.dataType)) {
                return data.characterMaxLength !== undefined && data.characterMaxLength > 0;
            }
            return true;
        },
        {
            message: "Character max length is required for VARCHAR/CHAR types and must be positive",
            path: ["characterMaxLength"],
        }
    )
    .refine(
        data => {
            if ([DataType.DECIMAL, DataType.NUMERIC].includes(data.dataType)) {
                return data.numericPrecision !== undefined && data.numericPrecision > 0;
            }
            return true;
        },
        {
            message: "Numeric precision is required for DECIMAL/NUMERIC types",
            path: ["numericPrecision"],
        }
    )
    .refine(
        data => {
            if ([DataType.DECIMAL, DataType.NUMERIC].includes(data.dataType)) {
                return data.numericScale !== undefined && data.numericScale >= 0;
            }
            return true;
        },
        {
            message: "Numeric scale is required for DECIMAL/NUMERIC types",
            path: ["numericScale"],
        }
    )
    .refine(
        data => {
            if ([DataType.DECIMAL, DataType.NUMERIC].includes(data.dataType)) {
                return (
                    data.numericPrecision === undefined ||
                    data.numericScale === undefined ||
                    data.numericScale <= data.numericPrecision
                );
            }
            return true;
        },
        {
            message: "Numeric scale must be less than or equal to numeric precision",
            path: ["numericScale"],
        }
    )
    .refine(
        data => {
            if (![DataType.VARCHAR, DataType.CHAR].includes(data.dataType)) {
                return data.characterMaxLength === undefined;
            }
            return true;
        },
        {
            message: "Character max length must be null for this data type",
            path: ["characterMaxLength"],
        }
    )
    .refine(
        data => {
            if (![DataType.DECIMAL, DataType.NUMERIC].includes(data.dataType)) {
                return data.numericPrecision === undefined && data.numericScale === undefined;
            }
            return true;
        },
        {
            message: "Numeric precision and scale must be null for this data type",
            path: ["numericPrecision"],
        }
    );

export const updateColumnAutoIncrementSchema = z.object({
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
    columnName: z
        .string()
        .min(1, "Column name cannot be blank")
        .regex(
            namePattern,
            "Column name must start with a letter and contain only alphanumeric characters and underscores"
        ),
    autoIncrement: z.boolean(),
});

export type RenameColumnSchema = z.infer<typeof renameColumnSchema>;
export type UpdateColumnDataTypeSchema = z.infer<typeof updateColumnDataTypeSchema>;
export type UpdateColumnAutoIncrementSchema = z.infer<typeof updateColumnAutoIncrementSchema>;
