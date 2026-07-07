import { db, eq, and, asc, desc, sql } from "@repo/database";
import {
  problemsTable,
  problemParamsTable,
  testCasesTable,
  languagesTable,
  submissionsTable,
  submissionResultsTable,
  userProblemStatusTable,
} from "@repo/database/schema";
import {
  getGenerator,
  serializeStdin,
  serializeExpected,
  type ProblemSignature,
} from "@repo/judge0";
import {
  judge0Client,
  mapJudge0Status,
  type Judge0BatchEntry,
  type Judge0Result,
} from "../clients/judge0";
import {
  createSubmissionInputSchema,
  CreateSubmissionInputType,
  runSampleTestsInputSchema,
  RunSampleTestsInputType,
  getSubmissionByIdInputSchema,
  GetSubmissionByIdInputType,
  listUserSubmissionsInputSchema,
  ListUserSubmissionsInputType,
} from "./model";

class SubmissionService {
  /**
   * Shared setup for judged and sample runs: load the problem, its signature,
   * the language, and the test cases, then generate the full source and one
   * Judge0 batch entry per test case.
   */
  private async prepareRun(
    problemId: string,
    languageSlug: string,
    sourceCode: string,
    samplesOnly: boolean,
  ) {
    const [problem] = await db.select().from(problemsTable).where(eq(problemsTable.id, problemId));

    if (!problem) {
      throw new Error("Problem not found");
    }

    const [language] = await db
      .select()
      .from(languagesTable)
      .where(and(eq(languagesTable.slug, languageSlug), eq(languagesTable.isActive, true)));

    if (!language) {
      throw new Error("Language not found");
    }

    const params = await db
      .select()
      .from(problemParamsTable)
      .where(eq(problemParamsTable.problemId, problemId))
      .orderBy(asc(problemParamsTable.position));

    const testCaseConditions = [eq(testCasesTable.problemId, problemId)];
    if (samplesOnly) {
      testCaseConditions.push(eq(testCasesTable.isSample, true));
    }
    //loading testcases and signature
    const testCases = await db
      .select()
      .from(testCasesTable)
      .where(and(...testCaseConditions))
      .orderBy(asc(testCasesTable.position));

    if (testCases.length === 0) {
      throw new Error("Problem has no test cases");
    }

    const signature: ProblemSignature = {
      functionName: problem.functionName,
      returnType: problem.returnType,
      parameters: params.map((param) => ({
        name: param.name,
        type: param.type,
        elementType: param.type,
      })),
    };

    //calling generator to generate the full sourcecode
    const generator = getGenerator(languageSlug);
    const fullSource = generator.generateSource(signature, sourceCode);

    //standard entry for judge0
    const entries: Judge0BatchEntry[] = testCases.map((testCase) => ({
      source_code: fullSource,
      language_id: language.judge0Id,
      stdin: serializeStdin(testCase.input as unknown[]),
      expected_output: serializeExpected(testCase.expectedOutput),
      cpu_time_limit: problem.timeLimitMs / 1000,
      memory_limit: problem.memoryLimitKb,
    }));

    return { problem, language, testCases, entries };
  }

  /**
   * Keep the denormalized per-user problem status in sync: `solved` is sticky
   * (an accepted submission never downgrades), everything else marks
   * `attempted`.
   */
  private async upsertProgress(
    userId: string,
    problemId: string,
    submissionId: string,
    overallStatus: string,
  ) {
    const solved = overallStatus === "accepted";

    const [existing] = await db
      .select()
      .from(userProblemStatusTable)
      .where(
        and(
          eq(userProblemStatusTable.userId, userId),
          eq(userProblemStatusTable.problemId, problemId),
        ),
      );

    if (!existing) {
      await db.insert(userProblemStatusTable).values({
        userId,
        problemId,
        status: solved ? "solved" : "attempted",
        lastSubmissionId: submissionId,
        solvedAt: solved ? new Date() : null,
      });
      return;
    }

    await db
      .update(userProblemStatusTable)
      .set({
        status: solved || existing.status === "solved" ? "solved" : "attempted",
        lastSubmissionId: submissionId,
        ...(solved && !existing.solvedAt && { solvedAt: new Date() }),
      })
      .where(
        and(
          eq(userProblemStatusTable.userId, userId),
          eq(userProblemStatusTable.problemId, problemId),
        ),
      );
  }
  public async createSubmission(payload: CreateSubmissionInputType) {
    const { userId, problemId, languageSlug, sourceCode } =
      await createSubmissionInputSchema.parseAsync(payload);

    const { problem, language, testCases, entries } = await this.prepareRun(
      problemId,
      languageSlug,
      sourceCode,
      false,
    );

    const [submission] = await db
      .insert(submissionsTable)
      .values({
        userId,
        problemId,
        languageId: language.id,
        sourceCode,
        status: "judging",
        totalTestCases: testCases.length,
      })
      .returning();

    if (!submission) {
      throw new Error("Failed to create submission");
    }

    const results = await judge0Client.runBatch(entries);

    const mapped = results.map((result, index) => ({
      submissionId: submission.id,
      testCaseId: testCases[index]?.id ?? null,
      status: mapJudge0Status(result.status.id),
      stdout: result.stdout,
      stderr: result.stderr ?? result.compile_output,
      timeMs: result.time ? Math.round(parseFloat(result.time) * 1000) : null,
      memoryKb: result.memory,
      judge0Token: result.token,
    }));

    await db.insert(submissionResultsTable).values(mapped);

    const firstFailed = mapped.find((r) => r.status !== "accepted");
    const overallStatus = firstFailed?.status ?? "accepted";
    const passedTestCases = mapped.filter((r) => r.status === "accepted").length;
    const runtimeMs = Math.max(0, ...mapped.map((r) => r.timeMs ?? 0));
    const memoryKb = Math.max(0, ...mapped.map((r) => r.memoryKb ?? 0));

    const [updated] = await db
      .update(submissionsTable)
      .set({
        status: overallStatus,
        passedTestCases,
        runtimeMs,
        memoryKb,
        errorMessage: firstFailed?.stderr ?? null,
      })
      .where(eq(submissionsTable.id, submission.id))
      .returning();

    await db
      .update(problemsTable)
      .set({
        totalSubmissions: sql`${problemsTable.totalSubmissions} + 1`,
        ...(overallStatus === "accepted" && {
          totalAccepted: sql`${problemsTable.totalAccepted} + 1`,
        }),
      })
      .where(eq(problemsTable.id, problem.id));

    await this.upsertProgress(userId, problem.id, submission.id, overallStatus);

    return { submission: updated, results: mapped };
  }

  public async runSampleTests(payload: RunSampleTestsInputType) {
    const { problemId, languageSlug, sourceCode } =
      await runSampleTestsInputSchema.parseAsync(payload);

    const { testCases, entries } = await this.prepareRun(problemId, languageSlug, sourceCode, true);

    const results = await judge0Client.runBatch(entries);

    return {
      results: results.map((result: Judge0Result, index: number) => ({
        testCaseId: testCases[index]?.id ?? null,
        input: testCases[index]?.input ?? null,
        expectedOutput: testCases[index]?.expectedOutput ?? null,
        status: mapJudge0Status(result.status.id),
        stdout: result.stdout,
        stderr: result.stderr ?? result.compile_output,
        timeMs: result.time ? Math.round(parseFloat(result.time) * 1000) : null,
        memoryKb: result.memory,
      })),
    };
  }

  public async getSubmissionById(payload: GetSubmissionByIdInputType) {
    const { id, userId } = await getSubmissionByIdInputSchema.parseAsync(payload);

    const [submission] = await db
      .select()
      .from(submissionsTable)
      .where(and(eq(submissionsTable.id, id), eq(submissionsTable.userId, userId)));

    if (!submission) {
      throw new Error("Submission not found");
    }

    const results = await db
      .select()
      .from(submissionResultsTable)
      .where(eq(submissionResultsTable.submissionId, id));

    return { submission, results };
  }

  public async listUserSubmissions(payload: ListUserSubmissionsInputType) {
    const { userId, problemId, limit, offset } =
      await listUserSubmissionsInputSchema.parseAsync(payload);

    const conditions = [eq(submissionsTable.userId, userId)];
    if (problemId) {
      conditions.push(eq(submissionsTable.problemId, problemId));
    }

    const submissions = await db
      .select({
        id: submissionsTable.id,
        problemId: submissionsTable.problemId,
        status: submissionsTable.status,
        runtimeMs: submissionsTable.runtimeMs,
        memoryKb: submissionsTable.memoryKb,
        passedTestCases: submissionsTable.passedTestCases,
        totalTestCases: submissionsTable.totalTestCases,
        createdAt: submissionsTable.createdAt,
        language: languagesTable.name,
        problemTitle: problemsTable.title,
        problemSlug: problemsTable.slug,
      })
      .from(submissionsTable)
      .innerJoin(languagesTable, eq(submissionsTable.languageId, languagesTable.id))
      .innerJoin(problemsTable, eq(submissionsTable.problemId, problemsTable.id))
      .where(and(...conditions))
      .orderBy(desc(submissionsTable.createdAt))
      .limit(limit)
      .offset(offset);

    return { submissions };
  }
}

export default SubmissionService;
