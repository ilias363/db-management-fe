import z from "zod";

const namePattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;

export const renameViewSchema = z.object({
    schemaName: z.
        string()
        .min(1, "Schema name cannot be blank")
        .regex(namePattern, "Schema name must start with a letter and contain only alphanumeric characters and underscores"),
    viewName: z
        .string()
        .min(1, "View name cannot be blank")
        .regex(namePattern, "View name must start with a letter and contain only alphanumeric characters and underscores"),
    updatedViewName: z
        .string()
        .min(1, "New view name cannot be blank")
        .regex(namePattern, "New view name must start with a letter and contain only alphanumeric characters and underscores"),
});

export type RenameViewSchema = z.infer<typeof renameViewSchema>;
