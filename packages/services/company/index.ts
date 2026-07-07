import { db, asc } from "@repo/database";
import { companiesTable } from "@repo/database/schema";

class CompanyService {
  public async listCompanies() {
    const companies = await db
      .select()
      .from(companiesTable)
      .orderBy(asc(companiesTable.name));

    return { companies };
  }
}

export default CompanyService;
