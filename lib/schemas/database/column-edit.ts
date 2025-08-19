import { DataType, FKOnAction } from "@/lib/types";
import { z } from "zod";
import { createColumnDefaultValidator } from "./column";

const namePattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;

const baseUpdateColumnSchema = z.object({
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
});

export const renameColumnSchema = baseUpdateColumnSchema.extend({
    newColumnName: z
        .string()
        .min(1, "New column name cannot be blank")
        .regex(
            namePattern,
            "New column name must start with a letter and contain only alphanumeric characters and underscores"
        ),
});

export const updateColumnDataTypeSchema = baseUpdateColumnSchema
    .extend({
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

export const updateColumnAutoIncrementSchema = baseUpdateColumnSchema.extend({
    autoIncrement: z.boolean(),
});

// Nullable toggle schema
export const updateColumnNullableSchema = baseUpdateColumnSchema.extend({
    isNullable: z.boolean(),
    populate: z.boolean().optional(),
});

// Unique toggle schema
export const updateColumnUniqueSchema = baseUpdateColumnSchema.extend({
    isUnique: z.boolean(),
});

// Column default update schema
export const updateColumnDefaultSchema = baseUpdateColumnSchema
    .extend({
        columnDefault: z.string().optional(),
        // Include column metadata for validation
        dataType: z.enum(DataType),
        characterMaxLength: z.number().int().positive().optional(),
        numericPrecision: z.number().int().positive().optional(),
        numericScale: z.number().int().min(0).optional(),
        isUnique: z.boolean(),
    })
    .refine(
        data => {
            if (data.columnDefault && data.columnDefault.trim() !== "") {
                const validator = createColumnDefaultValidator(
                    data.dataType,
                    data.characterMaxLength,
                    data.numericPrecision,
                    data.numericScale,
                    data.isUnique
                );
                try {
                    validator.parse(data.columnDefault);
                    return true;
                } catch {
                    return false;
                }
            }
            return true;
        },
        {
            message: "Invalid default value for the specified data type and parameters",
            path: ["columnDefault"],
        }
    );

// Primary key toggle schema
export const updateColumnPrimaryKeySchema = z.object({
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
    columnNames: z
        .array(
            z
                .string()
                .min(1, "Column name cannot be blank")
                .regex(
                    namePattern,
                    "Column name must start with a letter and contain only alphanumeric characters and underscores"
                )
        )
        .min(1, "At least one column must be selected for the primary key"),
    isPrimaryKey: z.boolean(),
    force: z.boolean().optional(),
});

// Foreign key update schema
export const updateColumnForeignKeySchema = baseUpdateColumnSchema.extend({
    isForeignKey: z.boolean(),
    referencedSchemaName: z
        .string()
        .min(1, "Referenced schema name cannot be blank")
        .regex(
            namePattern,
            "Referenced schema name must start with a letter and contain only alphanumeric characters and underscores"
        )
        .optional(),
    referencedTableName: z
        .string()
        .min(1, "Referenced table name cannot be blank")
        .regex(
            namePattern,
            "Referenced table name must start with a letter and contain only alphanumeric characters and underscores"
        )
        .optional(),
    referencedColumnName: z
        .string()
        .min(1, "Referenced column name cannot be blank")
        .regex(
            namePattern,
            "Referenced column name must start with a letter and contain only alphanumeric characters and underscores"
        )
        .optional(),
    onUpdateAction: z.enum(FKOnAction).optional(),
    onDeleteAction: z.enum(FKOnAction).optional(),
})
    .refine(
        data => {
            if (data.isForeignKey) {
                return (
                    data.referencedSchemaName &&
                    data.referencedTableName &&
                    data.referencedColumnName &&
                    data.onUpdateAction &&
                    data.onDeleteAction
                );
            }
            return true;
        },
        {
            message: "All foreign key fields are required when creating a foreign key constraint",
            path: ["referencedSchemaName"],
        }
    );

export type RenameColumnSchema = z.infer<typeof renameColumnSchema>;
export type UpdateColumnDataTypeSchema = z.infer<typeof updateColumnDataTypeSchema>;
export type UpdateColumnAutoIncrementSchema = z.infer<typeof updateColumnAutoIncrementSchema>;
export type UpdateColumnPrimaryKeySchema = z.infer<typeof updateColumnPrimaryKeySchema>;
export type UpdateColumnNullableSchema = z.infer<typeof updateColumnNullableSchema>;
export type UpdateColumnUniqueSchema = z.infer<typeof updateColumnUniqueSchema>;
export type UpdateColumnDefaultSchema = z.infer<typeof updateColumnDefaultSchema>;
export type UpdateColumnForeignKeySchema = z.infer<typeof updateColumnForeignKeySchema>;
