import { z } from "zod";
import { permissionSchema } from "./permission";

export const createRoleSchema = z.object({
    name: z
        .string()
        .min(3, { error: "Role name must be at least 3 characters" })
        .max(50, { error: "Role name must be less than 50 characters" }),
    description: z.string().optional(),
    permissions: z
        .array(permissionSchema)
        .min(1, { error: "At least one permission must be selected" }),
});

export const updateRoleSchema = z.object({
    id: z.number(),
    name: z
        .string()
        .min(3, { error: "Role name must be at least 3 characters" })
        .max(50, { error: "Role name must be less than 50 characters" }),
    description: z.string().optional(),
    permissions: z
        .array(permissionSchema)
        .min(1, { error: "At least one permission must be selected" }),
});

export type CreateRoleFormData = z.infer<typeof createRoleSchema>;
export type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;