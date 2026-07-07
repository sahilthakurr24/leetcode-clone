import { db, eq, and, or, asc, inArray } from "@repo/database";
import {
  problemsTable,
  problemParamsTable,
  problemHintsTable,
  testCasesTable,
  problemLanguagesTable,
  languagesTable,
} from "@repo/database/schema";
import {
  listProblemsInputSchema,
  ListProblemsInputType,
  getProblemBySlugInputSchema,
  GetProblemBySlugInputType,
  getProblemByIdInputSchema,
  GetProblemByIdInputType,
  createProblemInputSchema,
  CreateProblemInputType,
  setProblemPublishedInputSchema,
  SetProblemPublishedInputType,
  deleteProblemInputSchema,
  DeleteProblemInputType,
} from "./model";

class ProblemService {
  public async listProblems(payload: ListProblemsInputType) {
    const { limit, offset, difficulty } =
      await listProblemsInputSchema.parseAsync(payload);

    const conditions = [eq(problemsTable.isPublished, true)];
    if (difficulty) {
      conditions.push(eq(problemsTable.difficulty, difficulty));
    }

    const problems = await db
      .select({
        id: problemsTable.id,
        displayId: problemsTable.displayId,
        slug: problemsTable.slug,
        title: problemsTable.title,
        difficulty: problemsTable.difficulty,
        totalSubmissions: problemsTable.totalSubmissions,
        totalAccepted: problemsTable.totalAccepted,
      })
      .from(problemsTable)
      .where(and(...conditions))
      .orderBy(asc(problemsTable.displayId))
      .limit(limit)
      .offset(offset);

    return { problems };
  }

  public async getProblemBySlug(payload: GetProblemBySlugInputType) {
    const { slug } = await getProblemBySlugInputSchema.parseAsync(payload);

    const [problem] = await db
      .select()
      .from(problemsTable)
      .where(eq(problemsTable.slug, slug));

    if (!problem) {
      throw new Error("Problem not found");
    }

    return this.getProblemDetail(problem);
  }

  public async getProblemById(payload: GetProblemByIdInputType) {
    const { id } = await getProblemByIdInputSchema.parseAsync(payload);

    const [problem] = await db
      .select()
      .from(problemsTable)
      .where(eq(problemsTable.id, id));

    if (!problem) {
      throw new Error("Problem not found");
    }

    return this.getProblemDetail(problem);
  }

  public async createProblem(payload: CreateProblemInputType) {
    const input = await createProblemInputSchema.parseAsync(payload);

    const [duplicate] = await db
      .select({ id: problemsTable.id })
      .from(problemsTable)
      .where(
        or(
          eq(problemsTable.slug, input.slug),
          eq(problemsTable.displayId, input.displayId),
        ),
      );

    if (duplicate) {
      throw new Error("A problem with this slug or displayId already exists");
    }

    // Resolve starter-code language slugs up front so a bad slug fails before
    // anything is written.
    const starterSlugs = input.starterCodes.map((s) => s.languageSlug);
    const languages = starterSlugs.length
      ? await db
          .select({ id: languagesTable.id, slug: languagesTable.slug })
          .from(languagesTable)
          .where(inArray(languagesTable.slug, starterSlugs))
      : [];
    const languageBySlug = new Map(languages.map((l) => [l.slug, l.id]));
    for (const slug of starterSlugs) {
      if (!languageBySlug.has(slug)) {
        throw new Error(`Language not found: ${slug}`);
      }
    }

    // Problem + params + test cases + hints + starter codes are one unit —
    // insert them atomically.
    const problem = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(problemsTable)
        .values({
          displayId: input.displayId,
          slug: input.slug,
          title: input.title,
          description: input.description,
          constraints: input.constraints,
          difficulty: input.difficulty,
          functionName: input.functionName,
          returnType: input.returnType,
          ...(input.timeLimitMs && { timeLimitMs: input.timeLimitMs }),
          ...(input.memoryLimitKb && { memoryLimitKb: input.memoryLimitKb }),
          authorId: input.authorId,
          isPublished: input.isPublished,
        })
        .returning();

      if (!created) {
        throw new Error("Failed to create problem");
      }

      await tx.insert(problemParamsTable).values(
        input.params.map((param, position) => ({
          problemId: created.id,
          name: param.name,
          type: param.type,
          position,
        })),
      );

      await tx.insert(testCasesTable).values(
        input.testCases.map((testCase, position) => ({
          problemId: created.id,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          isSample: testCase.isSample,
          explanation: testCase.explanation,
          position,
        })),
      );

      if (input.hints.length > 0) {
        await tx.insert(problemHintsTable).values(
          input.hints.map((content, position) => ({
            problemId: created.id,
            content,
            position,
          })),
        );
      }

      if (input.starterCodes.length > 0) {
        await tx.insert(problemLanguagesTable).values(
          input.starterCodes.map((starter) => ({
            problemId: created.id,
            languageId: languageBySlug.get(starter.languageSlug)!,
            starterCode: starter.starterCode,
            solutionCode: starter.solutionCode,
          })),
        );
      }

      return created;
    });

    return this.getProblemDetail(problem);
  }

  public async setProblemPublished(payload: SetProblemPublishedInputType) {
    const { id, isPublished } =
      await setProblemPublishedInputSchema.parseAsync(payload);

    const [problem] = await db
      .update(problemsTable)
      .set({ isPublished })
      .where(eq(problemsTable.id, id))
      .returning();

    if (!problem) {
      throw new Error("Problem not found");
    }

    return { problem };
  }

  public async deleteProblem(payload: DeleteProblemInputType) {
    const { id } = await deleteProblemInputSchema.parseAsync(payload);

    const [deleted] = await db
      .delete(problemsTable)
      .where(eq(problemsTable.id, id))
      .returning({ id: problemsTable.id });

    if (!deleted) {
      throw new Error("Problem not found");
    }

    return { success: true };
  }

  private async getProblemDetail(problem: typeof problemsTable.$inferSelect) {
    const params = await db
      .select()
      .from(problemParamsTable)
      .where(eq(problemParamsTable.problemId, problem.id))
      .orderBy(asc(problemParamsTable.position));

    const sampleTestCases = await db
      .select()
      .from(testCasesTable)
      .where(
        and(
          eq(testCasesTable.problemId, problem.id),
          eq(testCasesTable.isSample, true),
        ),
      )
      .orderBy(asc(testCasesTable.position));

    const hints = await db
      .select()
      .from(problemHintsTable)
      .where(eq(problemHintsTable.problemId, problem.id))
      .orderBy(asc(problemHintsTable.position));

    const languages = await db
      .select({
        id: problemLanguagesTable.id,
        starterCode: problemLanguagesTable.starterCode,
        language: languagesTable,
      })
      .from(problemLanguagesTable)
      .innerJoin(
        languagesTable,
        eq(problemLanguagesTable.languageId, languagesTable.id),
      )
      .where(eq(problemLanguagesTable.problemId, problem.id));

    return { problem, params, sampleTestCases, hints, languages };
  }
}

export default ProblemService;
