import { z } from "zod";

export const listCompaniesInputSchema = z.object({});

export type ListCompaniesInputType = z.infer<typeof listCompaniesInputSchema>;

export const createCompanyInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes"),
  logoUrl: z.string().url().optional(),
});

export type CreateCompanyInputType = z.infer<typeof createCompanyInputSchema>;
