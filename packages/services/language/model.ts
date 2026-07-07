import { z } from "zod";

export const listLanguagesInputSchema = z.object({
  includeInactive: z.boolean().default(false),
});

export type ListLanguagesInputType = z.infer<typeof listLanguagesInputSchema>;
