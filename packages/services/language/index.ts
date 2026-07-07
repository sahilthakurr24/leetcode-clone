import { db, eq, asc } from "@repo/database";
import { languagesTable } from "@repo/database/schema";
import {
  listLanguagesInputSchema,
  ListLanguagesInputType,
} from "./model";

class LanguageService {
  public async listLanguages(payload: ListLanguagesInputType) {
    const { includeInactive } =
      await listLanguagesInputSchema.parseAsync(payload);

    const languages = await db
      .select()
      .from(languagesTable)
      .where(includeInactive ? undefined : eq(languagesTable.isActive, true))
      .orderBy(asc(languagesTable.name));

    return { languages };
  }
}

export default LanguageService;
