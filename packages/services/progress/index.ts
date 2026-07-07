import { db, eq, and, desc } from "@repo/database";
import {
  userProblemStatusTable,
  problemsTable,
} from "@repo/database/schema";
import {
  getUserProgressInputSchema,
  GetUserProgressInputType,
  getProblemStatusInputSchema,
  GetProblemStatusInputType,
} from "./model";

class ProgressService {
  public async getUserProgress(payload: GetUserProgressInputType) {
    const { userId } = await getUserProgressInputSchema.parseAsync(payload);

    const progress = await db
      .select({
        problemId: userProblemStatusTable.problemId,
        status: userProblemStatusTable.status,
        solvedAt: userProblemStatusTable.solvedAt,
        updatedAt: userProblemStatusTable.updatedAt,
        slug: problemsTable.slug,
        title: problemsTable.title,
        difficulty: problemsTable.difficulty,
      })
      .from(userProblemStatusTable)
      .innerJoin(
        problemsTable,
        eq(userProblemStatusTable.problemId, problemsTable.id),
      )
      .where(eq(userProblemStatusTable.userId, userId))
      .orderBy(desc(userProblemStatusTable.updatedAt));

    return { progress };
  }

  public async getProblemStatus(payload: GetProblemStatusInputType) {
    const { userId, problemId } =
      await getProblemStatusInputSchema.parseAsync(payload);

    const [status] = await db
      .select()
      .from(userProblemStatusTable)
      .where(
        and(
          eq(userProblemStatusTable.userId, userId),
          eq(userProblemStatusTable.problemId, problemId),
        ),
      );

    return { status: status ?? null };
  }
}

export default ProgressService;
