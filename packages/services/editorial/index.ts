import { db, eq } from "@repo/database";
import { editorialsTable } from "@repo/database/schema";
import {
  getEditorialByProblemIdInputSchema,
  GetEditorialByProblemIdInputType,
} from "./model";

class EditorialService {
  public async getEditorialByProblemId(
    payload: GetEditorialByProblemIdInputType,
  ) {
    const { problemId } =
      await getEditorialByProblemIdInputSchema.parseAsync(payload);

    const [editorial] = await db
      .select()
      .from(editorialsTable)
      .where(eq(editorialsTable.problemId, problemId));

    if (!editorial) {
      throw new Error("Editorial not found");
    }

    return { editorial };
  }
}

export default EditorialService;
