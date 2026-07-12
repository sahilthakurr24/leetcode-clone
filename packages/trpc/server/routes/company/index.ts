import z from "zod";

import { companyService } from "../../services";
import { zodUndefinedModel } from "../../schema";
import { adminProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Company"];
const getPath = generatePath("/company");

export const listCompaniesOutputSchema = z.object({
  companies: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      slug: z.string(),
      logoUrl: z.string().nullable(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }),
  ),
});

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

export const createCompanyOutputSchema = z.object({
  company: z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    logoUrl: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
});

export const companyRouter = router({
  listCompanies: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("list"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(listCompaniesOutputSchema)
    .query(() => companyService.listCompanies()),

  createCompany: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath("create"), tags: TAGS } })
    .input(createCompanyInputSchema)
    .output(createCompanyOutputSchema)
    .mutation(({ input }) => companyService.createCompany(input)),
});
