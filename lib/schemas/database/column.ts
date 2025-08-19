import { AUTO_INCREMENT_COMPATIBLE_TYPES, ColumnType, DataType, FKOnAction } from "@/lib/types";
import z from "zod";

const namePattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;

// BASE COLUMN DATA TYPE VALIDATION SCHEMA
const baseColumnDataTypeDefinitionSchema = z.object({
    dataType: z.enum(DataType),
    characterMaxLength: z.number().int().positive().optional(),
    numericPrecision: z.number().int().positive().optional(),
    numericScale: z.number().int().min(0).optional(),
});

// COLUMN DEFAULT VALUE VALIDATION
export const createColumnDefaultValidator = (
    dataType: DataType,
    characterMaxLength?: number,
    numericPrecision?: number,
    numericScale?: number,
    isUnique?: boolean
) => {
    return z
        .string()
        .optional()
        .refine(
            defaultValue => {
                if (
                    isUnique &&
                    defaultValue &&
                    defaultValue.trim() !== "" &&
                    !["NULL", "null"].includes(defaultValue)
                ) {
                    return false;
                }
                return true;
            },
            {
                message: "Unique columns should have NULL default value or no default value",
            }
        )
        .refine(
            defaultValue => {
                if (
                    dataType === DataType.TEXT &&
                    defaultValue &&
                    defaultValue.trim() !== "" &&
                    !["NULL", "null"].includes(defaultValue)
                ) {
                    return false;
                }
                return true;
            },
            {
                message: "TEXT columns cannot have default values",
            }
        )
        .refine(
            defaultValue => {
                if (
                    [DataType.VARCHAR, DataType.CHAR].includes(dataType) &&
                    defaultValue &&
                    defaultValue.trim() !== "" &&
                    !["NULL", "null"].includes(defaultValue) &&
                    characterMaxLength
                ) {
                    return defaultValue.length <= characterMaxLength;
                }
                return true;
            },
            {
                message: `String value exceeds maximum length of ${characterMaxLength} characters`,
            }
        )
        .refine(
            defaultValue => {
                if (
                    [DataType.INT, DataType.INTEGER, DataType.SMALLINT, DataType.BIGINT].includes(dataType) &&
                    defaultValue &&
                    defaultValue.trim() !== "" &&
                    !["NULL", "null"].includes(defaultValue)
                ) {
                    return /^-?\d+$/.test(defaultValue);
                }
                return true;
            },
            {
                message: "Default value must be a valid integer (e.g., 123, -456)",
            }
        )
        .refine(
            defaultValue => {
                if (
                    [DataType.DECIMAL, DataType.NUMERIC].includes(dataType) &&
                    defaultValue &&
                    defaultValue.trim() !== "" &&
                    !["NULL", "null"].includes(defaultValue)
                ) {
                    return /^-?\d+(\.\d+)?$/.test(defaultValue);
                }
                return true;
            },
            {
                message: "Default value must be a valid decimal number (e.g., 123.45, -67.89)",
            }
        )
        .refine(
            defaultValue => {
                if (
                    [DataType.DECIMAL, DataType.NUMERIC].includes(dataType) &&
                    defaultValue &&
                    defaultValue.trim() !== "" &&
                    !["NULL", "null"].includes(defaultValue) &&
                    numericPrecision &&
                    numericScale !== undefined
                ) {
                    const [intPart, decPart = ""] = defaultValue.split(".");
                    return (
                        intPart.replace("-", "").length + decPart.length <= numericPrecision &&
                        decPart.length <= numericScale
                    );
                }
                return true;
            },
            {
                message: `Decimal value exceeds precision (${numericPrecision}) or scale (${numericScale}) limits`,
            }
        )
        .refine(
            defaultValue => {
                if (
                    [DataType.FLOAT, DataType.REAL, DataType.DOUBLE].includes(dataType) &&
                    defaultValue &&
                    defaultValue.trim() !== "" &&
                    !["NULL", "null"].includes(defaultValue)
                ) {
                    return /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(defaultValue);
                }
                return true;
            },
            {
                message: "Default value must be a valid floating point number (e.g., 123.45, 1.23e-4)",
            }
        )
        .refine(
            defaultValue => {
                if (
                    dataType === DataType.BOOLEAN &&
                    defaultValue &&
                    defaultValue.trim() !== "" &&
                    !["NULL", "null"].includes(defaultValue)
                ) {
                    return ["0", "1", "true", "false", "TRUE", "FALSE"].includes(defaultValue);
                }
                return true;
            },
            {
                message: "Default value must be one of: 0, 1, true, false, TRUE, FALSE",
            }
        )
        .refine(
            defaultValue => {
                if (
                    dataType === DataType.DATE &&
                    defaultValue &&
                    defaultValue.trim() !== "" &&
                    !["NULL", "null"].includes(defaultValue)
                ) {
                    return /^\d{4}-\d{2}-\d{2}$/.test(defaultValue);
                }
                return true;
            },
            {
                message: "Default value must be in YYYY-MM-DD format (e.g., 2023-12-25)",
            }
        )
        .refine(
            defaultValue => {
                if (
                    dataType === DataType.TIME &&
                    defaultValue &&
                    defaultValue.trim() !== "" &&
                    !["NULL", "null"].includes(defaultValue)
                ) {
                    return /^\d{2}:\d{2}:\d{2}$/.test(defaultValue);
                }
                return true;
            },
            {
                message: "Default value must be in HH:MM:SS format (e.g., 14:30:00)",
            }
        )
        .refine(
            defaultValue => {
                if (
                    dataType === DataType.TIMESTAMP &&
                    defaultValue &&
                    defaultValue.trim() !== "" &&
                    !["NULL", "null"].includes(defaultValue)
                ) {
                    return (
                        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(defaultValue) ||
                        defaultValue === "CURRENT_TIMESTAMP"
                    );
                }
                return true;
            },
            {
                message: "Default value must be in YYYY-MM-DD HH:MM:SS format or CURRENT_TIMESTAMP",
            }
        );
};

// BASE COLUMN SCHEMA
const baseNewColumnSchema = baseColumnDataTypeDefinitionSchema.extend({
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
    // Data type validations
    .refine(
        data => {
            if ([DataType.VARCHAR, DataType.CHAR].includes(data.dataType)) {
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
            if ([DataType.DECIMAL, DataType.NUMERIC].includes(data.dataType)) {
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
            if ([DataType.DECIMAL, DataType.NUMERIC].includes(data.dataType)) {
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
            message: "numericScale must be less than or equal to numericPrecision",
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
            message: "characterMaxLength must be null for this data type",
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
            message: "numericPrecision and numericScale must be null for this data type",
            path: ["numericPrecision"],
        }
    )
    // Standard column specific validations
    .refine(
        data => {
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

// PRIMARY KEY COLUMN SCHEMA

export const primaryKeyColumnSchema = baseNewColumnSchema
    .extend({
        columnType: z.literal(ColumnType.PRIMARY_KEY),
        autoIncrement: z.boolean().optional(),
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
            message: "characterMaxLength is required for VARCHAR/CHAR types and must be positive",
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
            message: "numericPrecision is required for DECIMAL/NUMERIC types",
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
            message: "numericScale is required for DECIMAL/NUMERIC types",
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
            message: "numericScale must be less than or equal to numericPrecision",
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
            message: "characterMaxLength must be null for this data type",
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
            message: "numericPrecision and numericScale must be null for this data type",
            path: ["numericPrecision"],
        }
    )
    // Primary key specific validations
    .refine(
        data => {
            if (data.autoIncrement && !AUTO_INCREMENT_COMPATIBLE_TYPES.includes(data.dataType)) {
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
    // Data type validations
    .refine(
        data => {
            if ([DataType.VARCHAR, DataType.CHAR].includes(data.dataType)) {
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
            if ([DataType.DECIMAL, DataType.NUMERIC].includes(data.dataType)) {
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
            if ([DataType.DECIMAL, DataType.NUMERIC].includes(data.dataType)) {
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
            message: "numericScale must be less than or equal to numericPrecision",
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
            message: "characterMaxLength must be null for this data type",
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
            message: "numericPrecision and numericScale must be null for this data type",
            path: ["numericPrecision"],
        }
    )
    // Foreign key specific validations
    .refine(
        data => {
            // Validate default value for foreign key columns
            if (data.columnDefault && data.columnDefault.trim() !== "") {
                const validator = createColumnDefaultValidator(
                    data.dataType,
                    data.characterMaxLength,
                    data.numericPrecision,
                    data.numericScale,
                    false // Foreign keys are not unique by default
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
export const primaryKeyForeignKeyColumnSchema = baseNewColumnSchema
    .extend({
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
            message: "characterMaxLength is required for VARCHAR/CHAR types and must be positive",
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
            message: "numericPrecision is required for DECIMAL/NUMERIC types",
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
            message: "numericScale is required for DECIMAL/NUMERIC types",
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
            message: "numericScale must be less than or equal to numericPrecision",
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
            message: "characterMaxLength must be null for this data type",
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
            message: "numericPrecision and numericScale must be null for this data type",
            path: ["numericPrecision"],
        }
    );

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
