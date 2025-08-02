import { z } from "zod";

export const loginSchema = z.object({
    username: z
        .string()
        .min(3, { error: "Username must be at least 3 characters" })
        .max(20, { error: "Username must be less than 20 characters" })
        .regex(/^[a-zA-Z0-9_-]+$/, { error: "Username can only contain letters, numbers, underscores, and hyphens" }),
    password: z
        .string()
        .min(8, { error: "Password must be at least 8 characters" })
        .max(100, { error: "Password must be less than 100 characters" }),
})

export type LoginFormData = z.infer<typeof loginSchema>;