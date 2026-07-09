import z from "zod";

import { companyService } from "../../services";
import { zodUndefinedModel } from "../../schema";
import { publicProcedure, router } from "../../trpc";
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

export const companyRouter = router({
  listCompanies: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("list"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(listCompaniesOutputSchema)
    .query(() => companyService.listCompanies()),
});
