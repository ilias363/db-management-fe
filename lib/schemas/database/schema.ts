import z from "zod";

export const createSchemaSchema = z.object({
    schemaName: z
        .string()
        .min(1, { message: "Schema name is required" })
        .max(100, { message: "Schema name must be less than 100 characters" })
        .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
            message: "Schema name can only contain letters, numbers, and underscores and sould starts with a letter"
        }),
});
