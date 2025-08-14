import z from "zod";
import { PermissionType } from "../types";

const namePattern = /^[a-zA-Z][a-zA-Z0-9_]*$/

export const permissionSchema = z.object({
    schemaName: z
        .string()
        .nullable()
        .optional()
        .refine(
            (val) => !val || namePattern.test(val),
            { message: "Schema name must start with a letter and contain only letters, numbers, and underscores" }
        ),
    tableName: z
        .string()
        .nullable()
        .optional()
        .refine(
            (val) => !val || namePattern.test(val),
            { message: "Table name must start with a letter and contain only letters, numbers, and underscores" }
        ),
    viewName: z
        .string()
        .nullable()
        .optional()
        .refine(
            (val) => !val || namePattern.test(val),
            { message: "View name must start with a letter and contain only letters, numbers, and underscores" }
        ),
    permissionType: z.enum(PermissionType, { error: "Invalid permission type" }),
})
    .refine(
        (data) =>
            data.schemaName || (!data.tableName && !data.viewName),
        {
            message: "If schemaName is not set, tableName and viewName must also be unset",
            path: ["schemaName"],
        }
    )
    .refine(
        (data) => !(data.tableName && data.viewName),
        {
            message: "Only one of tableName or viewName can be set",
            path: ["tableName"],
        }
    );

export type PermissionSchema = z.infer<typeof permissionSchema>;
