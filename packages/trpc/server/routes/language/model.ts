import z from "zod";

export const listLanguagesInputSchema = z.object({
  includeInactive: z.coerce.boolean().default(false),
});

export const languageRowSchema = z.object({
  id: z.string().uuid(),
  judge0Id: z.number().int(),
  name: z.string(),
  slug: z.string(),
  monacoLanguage: z.string(),
  version: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const listLanguagesOutputSchema = z.object({
  languages: z.array(languageRowSchema),
});
