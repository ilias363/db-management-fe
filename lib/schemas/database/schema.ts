import z from "zod";

export const createSchemaSchema = z.object({
    schemaName: z
        .string()
        .min(1, { message: "Schema name is required" })
        .max(64, { message: "Schema name must be less than 64 characters" })
        .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
            message: "Schema name must start with a letter and contain only letters, numbers, and underscores",
        }),
});
