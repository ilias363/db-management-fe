import { ColumnType, DataType, FKOnAction } from "@/lib/types";
import z from "zod";

const namePattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;

// BASE COLUMN VALIDATION SCHEMA
const baseColumnDataTypeDefinitionSchema = z.object({
    dataType: z.enum(DataType),
    characterMaxLength: z.number().int().positive().optional(),
    numericPrecision: z.number().int().positive().optional(),
    numericScale: z.number().int().min(0).optional(),
});

// REFINED DATA TYPE VALIDATION
const columnDataTypeDefinitionSchema = baseColumnDataTypeDefinitionSchema
    .refine(
        data => {
            if (["VARCHAR", "CHAR"].includes(data.dataType)) {
                return data.characterMaxLength !== undefined && data.characterMaxLength > 0;
            }
            return true;
        },
        {
            message: "characterMaxLength is required for VARCHAR/CHAR types and must be positive",
            path: ["characterMaxLength"],
        }
    )
    .refine(
        data => {
            if (["DECIMAL", "NUMERIC"].includes(data.dataType)) {
                return data.numericPrecision !== undefined && data.numericPrecision > 0;
            }
            return true;
        },
        {
            message: "numericPrecision is required for DECIMAL/NUMERIC types",
            path: ["numericPrecision"],
        }
    )
    .refine(
        data => {
            if (["DECIMAL", "NUMERIC"].includes(data.dataType)) {
                return data.numericScale !== undefined && data.numericScale >= 0;
            }
            return true;
        },
        {
            message: "numericScale is required for DECIMAL/NUMERIC types",
            path: ["numericScale"],
        }
    )
    .refine(
        data => {
            if (!["VARCHAR", "CHAR"].includes(data.dataType)) {
                return data.characterMaxLength === undefined;
            }
            return true;
        },
        {
            message: "characterMaxLength must be null for this data type",
            path: ["characterMaxLength"],
        }
    )
    .refine(
        data => {
            if (!["DECIMAL", "NUMERIC"].includes(data.dataType)) {
                return data.numericPrecision === undefined && data.numericScale === undefined;
            }
            return true;
        },
        {
            message: "numericPrecision and numericScale must be null for this data type",
            path: ["numericPrecision"],
        }
    );

// COLUMN DEFAULT VALUE VALIDATION
const createColumnDefaultValidator = (
    dataType: string,
    characterMaxLength?: number,
    numericPrecision?: number,
    numericScale?: number,
    isUnique?: boolean,
    isNullable?: boolean
) => {
    return z
        .string()
        .optional()
        .refine(
            defaultValue => {
                if (!defaultValue || defaultValue.trim() === "") return true;

                // Unique columns should have null default
                if (isUnique && !["NULL", "null"].includes(defaultValue)) {
                    return false;
                }

                // If nullable and value is NULL, it's valid
                if (isNullable && ["NULL", "null"].includes(defaultValue)) {
                    return true;
                }

                switch (dataType.toUpperCase()) {
                    case "VARCHAR":
                    case "CHAR":
                        return characterMaxLength ? defaultValue.length <= characterMaxLength : true;

                    case "TEXT":
                        return false; // TEXT cannot have default

                    case "INT":
                    case "INTEGER":
                    case "SMALLINT":
                    case "BIGINT":
                        return /^-?\d+$/.test(defaultValue);

                    case "DECIMAL":
                    case "NUMERIC":
                        const decimalPattern = /^-?\d+(\.\d+)?$/;
                        if (!decimalPattern.test(defaultValue)) return false;

                        if (numericPrecision && numericScale !== undefined) {
                            const [intPart, decPart = ""] = defaultValue.split(".");
                            return (
                                intPart.length + decPart.length <= numericPrecision &&
                                decPart.length <= numericScale
                            );
                        }
                        return true;

                    case "FLOAT":
                    case "REAL":
                    case "DOUBLE":
                        return /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(defaultValue);

                    case "BOOLEAN":
                        return ["0", "1", "true", "false", "TRUE", "FALSE"].includes(defaultValue);

                    case "DATE":
                        return /^\d{4}-\d{2}-\d{2}$/.test(defaultValue);

                    case "TIME":
                        return /^\d{2}:\d{2}:\d{2}$/.test(defaultValue);

                    case "TIMESTAMP":
                        return (
                            /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(defaultValue) ||
                            defaultValue === "CURRENT_TIMESTAMP"
                        );

                    default:
                        return true;
                }
            },
            {
                message: "Invalid default value for the specified data type",
            }
        );
};

// BASE COLUMN SCHEMA
const baseNewColumnSchema = columnDataTypeDefinitionSchema.extend({
    columnName: z
        .string()
        .min(1, "Column name cannot be blank")
        .regex(
            namePattern,
            "Column name must start with a letter and contain only alphanumeric characters and underscores"
        ),
    columnType: z.enum(ColumnType),
});

// STANDARD COLUMN SCHEMA
export const standardColumnSchema = baseNewColumnSchema
    .extend({
        columnType: z.literal(ColumnType.STANDARD),
        isNullable: z.boolean().optional(),
        isUnique: z.boolean().optional(),
        columnDefault: z.string().optional(),
    })
    .refine(
        data => {
            // If isUnique is true and columnDefault is provided, default should be null
            if (
                data.isUnique &&
                data.columnDefault &&
                !["NULL", "null", ""].includes(data.columnDefault)
            ) {
                return false;
            }
            return true;
        },
        {
            message: "If a column is unique, the default value should be null",
            path: ["columnDefault"],
        }
    )
    .refine(
        data => {
            // Validate default value based on data type
            if (data.columnDefault && data.columnDefault.trim() !== "") {
                const validator = createColumnDefaultValidator(
                    data.dataType,
                    data.characterMaxLength,
                    data.numericPrecision,
                    data.numericScale,
                    data.isUnique,
                    data.isNullable
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
            message: "Invalid default value for the specified data type",
            path: ["columnDefault"],
        }
    );

// PRIMARY KEY COLUMN SCHEMA
const autoIncrementCompatibleTypes = ["INT", "INTEGER", "SMALLINT", "BIGINT"];

export const primaryKeyColumnSchema = baseNewColumnSchema
    .extend({
        columnType: z.literal(ColumnType.PRIMARY_KEY),
        autoIncrement: z.boolean().optional(),
    })
    .refine(
        data => {
            if (data.autoIncrement && !autoIncrementCompatibleTypes.includes(data.dataType)) {
                return false;
            }
            return true;
        },
        {
            message: "Auto-increment can only be used with INT, INTEGER, SMALLINT, or BIGINT data types",
            path: ["autoIncrement"],
        }
    );

// FOREIGN KEY COLUMN SCHEMA
export const foreignKeyColumnSchema = baseNewColumnSchema
    .extend({
        columnType: z.literal(ColumnType.FOREIGN_KEY),
        referencedSchemaName: z
            .string()
            .min(1, "Referenced schema name cannot be blank")
            .regex(
                namePattern,
                "Referenced schema name must start with a letter and contain only alphanumeric characters and underscores"
            ),
        referencedTableName: z
            .string()
            .min(1, "Referenced table name cannot be blank")
            .regex(
                namePattern,
                "Referenced table name must start with a letter and contain only alphanumeric characters and underscores"
            ),
        referencedColumnName: z
            .string()
            .min(1, "Referenced column name cannot be blank")
            .regex(
                namePattern,
                "Referenced column name must start with a letter and contain only alphanumeric characters and underscores"
            ),
        onDeleteAction: z.enum(FKOnAction).optional(),
        onUpdateAction: z.enum(FKOnAction).optional(),
        columnDefault: z.string().optional(),
        isNullable: z.boolean().optional(),
    })
    .refine(
        data => {
            // Validate default value for foreign key columns
            if (data.columnDefault && data.columnDefault.trim() !== "") {
                const validator = createColumnDefaultValidator(
                    data.dataType,
                    data.characterMaxLength,
                    data.numericPrecision,
                    data.numericScale,
                    false, // Foreign keys are not unique by default
                    data.isNullable
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
            message: "Invalid default value for the specified data type",
            path: ["columnDefault"],
        }
    );

// PRIMARY KEY + FOREIGN KEY COLUMN SCHEMA
export const primaryKeyForeignKeyColumnSchema = baseNewColumnSchema.extend({
    columnType: z.literal(ColumnType.PRIMARY_KEY_FOREIGN_KEY),
    referencedSchemaName: z
        .string()
        .min(1, "Referenced schema name cannot be blank")
        .regex(
            namePattern,
            "Referenced schema name must start with a letter and contain only alphanumeric characters and underscores"
        ),
    referencedTableName: z
        .string()
        .min(1, "Referenced table name cannot be blank")
        .regex(
            namePattern,
            "Referenced table name must start with a letter and contain only alphanumeric characters and underscores"
        ),
    referencedColumnName: z
        .string()
        .min(1, "Referenced column name cannot be blank")
        .regex(
            namePattern,
            "Referenced column name must start with a letter and contain only alphanumeric characters and underscores"
        ),
    onDeleteAction: z.enum(FKOnAction).optional(),
    onUpdateAction: z.enum(FKOnAction).optional(),
});

// DISCRIMINATED UNION FOR ALL COLUMN TYPES
export const columnSchema = z.discriminatedUnion("columnType", [
    standardColumnSchema,
    primaryKeyColumnSchema,
    foreignKeyColumnSchema,
    primaryKeyForeignKeyColumnSchema,
]);

export type StandardColumnSchema = z.infer<typeof standardColumnSchema>;
export type PrimaryKeyColumnSchema = z.infer<typeof primaryKeyColumnSchema>;
export type ForeignKeyColumnSchema = z.infer<typeof foreignKeyColumnSchema>;
export type PrimaryKeyForeignKeyColumnSchema = z.infer<typeof primaryKeyForeignKeyColumnSchema>;
export type ColumnSchema = z.infer<typeof columnSchema>;

// FORM FIELD HELPERS
export const getRequiredFieldsForDataType = (dataType: DataType) => {
    switch (dataType) {
        case DataType.VARCHAR:
        case DataType.CHAR:
            return { characterMaxLength: true };
        case DataType.DECIMAL:
        case DataType.NUMERIC:
            return { numericPrecision: true, numericScale: true };
        default:
            return {};
    }
};

export const getCompatibleDefaultValuePattern = (dataType: DataType) => {
    switch (dataType) {
        case DataType.VARCHAR:
        case DataType.CHAR:
            return "Any string value";
        case DataType.INT:
        case DataType.INTEGER:
        case DataType.SMALLINT:
        case DataType.BIGINT:
            return "Integer number (e.g., 123, -456)";
        case DataType.DECIMAL:
        case DataType.NUMERIC:
            return "Decimal number (e.g., 123.45)";
        case DataType.FLOAT:
        case DataType.REAL:
        case DataType.DOUBLE:
            return "Floating point number (e.g., 123.45, 1.23e-4)";
        case DataType.BOOLEAN:
            return "0, 1, true, false";
        case DataType.DATE:
            return "YYYY-MM-DD (e.g., 2023-12-25)";
        case DataType.TIME:
            return "HH:mm:ss (e.g., 14:30:00)";
        case DataType.TIMESTAMP:
            return "YYYY-MM-DD HH:mm:ss or CURRENT_TIMESTAMP";
        case DataType.TEXT:
            return "Cannot have default value";
        default:
            return "Any compatible value";
    }
};
