import { db, asc, eq } from "@repo/database";
import { companiesTable } from "@repo/database/schema";

import { createCompanyInputSchema, CreateCompanyInputType } from "./model";

class CompanyService {
  public async createCompany(payload: CreateCompanyInputType) {
    const input = await createCompanyInputSchema.parseAsync(payload);

    const [duplicate] = await db
      .select({ id: companiesTable.id })
      .from(companiesTable)
      .where(eq(companiesTable.slug, input.slug));
    if (duplicate) {
      throw new Error("A company with this slug already exists");
    }

    const [company] = await db
      .insert(companiesTable)
      .values(input)
      .returning();
    if (!company) throw new Error("Failed to create company");

    return { company };
  }

  public async listCompanies() {
    const companies = await db
      .select()
      .from(companiesTable)
      .orderBy(asc(companiesTable.name));

    return { companies };
  }
}

export default CompanyService;
