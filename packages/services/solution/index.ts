import { db, eq, and, desc, sql } from "@repo/database";
import {
  solutionsTable,
  solutionVotesTable,
  usersTable,
  languagesTable,
} from "@repo/database/schema";
import {
  listSolutionsInputSchema,
  ListSolutionsInputType,
  getSolutionByIdInputSchema,
  GetSolutionByIdInputType,
  createSolutionInputSchema,
  CreateSolutionInputType,
  voteSolutionInputSchema,
  VoteSolutionInputType,
} from "./model";

class SolutionService {
  public async listSolutions(payload: ListSolutionsInputType) {
    const { problemId, limit, offset } =
      await listSolutionsInputSchema.parseAsync(payload);

    const solutions = await db
      .select({
        id: solutionsTable.id,
        title: solutionsTable.title,
        upvotes: solutionsTable.upvotes,
        downvotes: solutionsTable.downvotes,
        createdAt: solutionsTable.createdAt,
        author: {
          id: usersTable.id,
          username: usersTable.username,
          profileImageUrl: usersTable.profileImageUrl,
        },
        language: languagesTable.name,
      })
      .from(solutionsTable)
      .innerJoin(usersTable, eq(solutionsTable.userId, usersTable.id))
      .leftJoin(languagesTable, eq(solutionsTable.languageId, languagesTable.id))
      .where(eq(solutionsTable.problemId, problemId))
      .orderBy(desc(solutionsTable.upvotes), desc(solutionsTable.createdAt))
      .limit(limit)
      .offset(offset);

    return { solutions };
  }

  public async getSolutionById(payload: GetSolutionByIdInputType) {
    const { id } = await getSolutionByIdInputSchema.parseAsync(payload);

    const [solution] = await db
      .select()
      .from(solutionsTable)
      .where(eq(solutionsTable.id, id));

    if (!solution) {
      throw new Error("Solution not found");
    }

    return { solution };
  }

  public async createSolution(payload: CreateSolutionInputType) {
    const { problemId, userId, languageId, title, content } =
      await createSolutionInputSchema.parseAsync(payload);

    const [solution] = await db
      .insert(solutionsTable)
      .values({ problemId, userId, languageId, title, content })
      .returning();

    return { solution };
  }

  public async voteSolution(payload: VoteSolutionInputType) {
    const { solutionId, userId, value } =
      await voteSolutionInputSchema.parseAsync(payload);

    const [existing] = await db
      .select()
      .from(solutionVotesTable)
      .where(
        and(
          eq(solutionVotesTable.solutionId, solutionId),
          eq(solutionVotesTable.userId, userId),
        ),
      );

    if (existing && existing.value === value) {
      throw new Error("Already voted");
    }

    if (existing) {
      await db
        .update(solutionVotesTable)
        .set({ value })
        .where(
          and(
            eq(solutionVotesTable.solutionId, solutionId),
            eq(solutionVotesTable.userId, userId),
          ),
        );
    } else {
      await db
        .insert(solutionVotesTable)
        .values({ solutionId, userId, value });
    }

    // Adjust denormalized counters: +1 on the new side, -1 on the old side
    // when the user flipped an existing vote.
    const upDelta = (value === 1 ? 1 : 0) - (existing?.value === 1 ? 1 : 0);
    const downDelta = (value === -1 ? 1 : 0) - (existing?.value === -1 ? 1 : 0);

    const [solution] = await db
      .update(solutionsTable)
      .set({
        upvotes: sql`${solutionsTable.upvotes} + ${upDelta}`,
        downvotes: sql`${solutionsTable.downvotes} + ${downDelta}`,
      })
      .where(eq(solutionsTable.id, solutionId))
      .returning();

    if (!solution) {
      throw new Error("Solution not found");
    }

    return { solution };
  }
}

export default SolutionService;
