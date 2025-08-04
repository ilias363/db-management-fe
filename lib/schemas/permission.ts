import z from "zod";
import { PermissionType } from "../types";

export const permissionSchema = z.object({
    schemaName: z
        .string()
        .regex(/^[a-zA-Z0-9_-]+$/,
            { error: "Schema name can only contain letters, numbers, underscores, and hyphens" })
        .optional(),
    tableName: z
        .string()
        .regex(/^[a-zA-Z0-9_-]+$/,
            { error: "Table name can only contain letters, numbers, underscores, and hyphens" })
        .optional(),
    viewName: z
        .string()
        .regex(/^[a-zA-Z0-9_-]+$/,
            { error: "View name can only contain letters, numbers, underscores, and hyphens" })
        .optional(),
    permissionType: z.enum(PermissionType, { error: "Invalid permission type" }),
})
    .refine(
        (data) =>
            data.schemaName !== undefined ||
            (data.tableName === undefined && data.viewName === undefined),
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
