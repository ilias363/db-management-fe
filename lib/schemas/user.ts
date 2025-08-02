import { z } from "zod";

export const createUserSchema = z.object({
    username: z
        .string()
        .min(3, { error: "Username must be at least 3 characters" })
        .max(20, { error: "Username must be less than 20 characters" })
        .regex(/^[a-zA-Z0-9_-]+$/,
            { error: "Username can only contain letters, numbers, underscores, and hyphens" }),
    password: z
        .string()
        .min(8, { error: "Password must be at least 8 characters" })
        .max(100, { error: "Password must be less than 100 characters" }),
    active: z.boolean().default(true),
    roles: z
        .array(z.number())
        .min(1, { error: "At least one role must be selected" }),
});

export const updateUserSchema = z.object({
    id: z.number(),
    username: z
        .string()
        .min(3, { error: "Username must be at least 3 characters" })
        .max(20, { error: "Username must be less than 20 characters" })
        .regex(/^[a-zA-Z0-9_-]+$/,
            { error: "Username can only contain letters, numbers, underscores, and hyphens" }),
    active: z.boolean(),
    roles: z
        .array(z.number())
        .min(1, { error: "At least one role must be selected" }),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
