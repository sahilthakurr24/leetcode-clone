import { z } from "zod";

export const listCompaniesInputSchema = z.object({});

export type ListCompaniesInputType = z.infer<typeof listCompaniesInputSchema>;
