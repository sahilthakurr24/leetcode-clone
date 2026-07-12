import { db, eq, and, or, ilike, desc, count, countDistinct } from "@repo/database";
import {
  usersTable,
  userProblemStatusTable,
  submissionsTable,
  problemsTable,
  languagesTable,
  problemTopicsTable,
  topicsTable,
} from "@repo/database/schema";
import { env } from "../env";
import { googleOAuth2Client } from "../clients/google-oauth";
import {
  GetAuthenticationMethodOutputSchema,
  getUserByIdInputSchema,
  GetUserByIdInputType,
  getUserByUsernameInputSchema,
  GetUserByUsernameInputType,
  isUsernameAvailableInputSchema,
  IsUsernameAvailableInputType,
  updateUserProfileInputSchema,
  UpdateUserProfileInputType,
  listUsersInputSchema,
  ListUsersInputType,
  getUserProfileByUsernameInputSchema,
  GetUserProfileByUsernameInputType,
  updateUserRoleInputSchema,
  UpdateUserRoleInputType,
} from "./model";

class UserService {
  public async getAuthenticationMethods(): Promise<
    ReadonlyArray<GetAuthenticationMethodOutputSchema>
  > {
    const supportedAuthenticationProviders: GetAuthenticationMethodOutputSchema[] = [];

    const isGoogleConfigured = !!(env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET);

    if (isGoogleConfigured) {
      const url = googleOAuth2Client.generateAuthUrl();
      supportedAuthenticationProviders.push({
        provider: "GOOGLE_OAUTH",
        displayName: "Google",
        displayText: "Signin with Google",
        authUrl: url,
      });
    }

    return supportedAuthenticationProviders;
  }

  public async getUserById(payload: GetUserByIdInputType) {
    const { id } = await getUserByIdInputSchema.parseAsync(payload);

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));

    if (!user) {
      throw new Error("User not found");
    }

    return { user };
  }

  public async getUserByUsername(payload: GetUserByUsernameInputType) {
    const { username } = await getUserByUsernameInputSchema.parseAsync(payload);

    const [user] = await db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        username: usersTable.username,
        profileImageUrl: usersTable.profileImageUrl,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.username, username));

    if (!user) {
      throw new Error("User not found");
    }

    return { user };
  }

  public async isUsernameAvailable(payload: IsUsernameAvailableInputType) {
    const { username } =
      await isUsernameAvailableInputSchema.parseAsync(payload);

    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.username, username));

    return { available: !existing };
  }

  public async updateUserProfile(payload: UpdateUserProfileInputType) {
    const { id, ...updates } =
      await updateUserProfileInputSchema.parseAsync(payload);

    if (Object.keys(updates).length === 0) {
      throw new Error("No fields to update");
    }

    const [user] = await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.id, id))
      .returning();

    if (!user) {
      throw new Error("User not found");
    }

    return { user };
  }

  /** Solved/total stats + language/topic breakdowns shared by the profile endpoints. */
  private async buildProfileStats(userId: string) {
    const solvedByDifficulty = await db
      .select({
        difficulty: problemsTable.difficulty,
        solved: count(),
      })
      .from(userProblemStatusTable)
      .innerJoin(
        problemsTable,
        eq(userProblemStatusTable.problemId, problemsTable.id),
      )
      .where(
        and(
          eq(userProblemStatusTable.userId, userId),
          eq(userProblemStatusTable.status, "solved"),
        ),
      )
      .groupBy(problemsTable.difficulty);

    const solved = { easy: 0, medium: 0, hard: 0, total: 0 };
    for (const row of solvedByDifficulty) {
      solved[row.difficulty] = row.solved;
      solved.total += row.solved;
    }

    const publishedByDifficulty = await db
      .select({
        difficulty: problemsTable.difficulty,
        total: count(),
      })
      .from(problemsTable)
      .where(eq(problemsTable.isPublished, true))
      .groupBy(problemsTable.difficulty);

    const totals = { easy: 0, medium: 0, hard: 0, total: 0 };
    for (const row of publishedByDifficulty) {
      totals[row.difficulty] = row.total;
      totals.total += row.total;
    }

    const [submissionStats] = await db
      .select({ total: count() })
      .from(submissionsTable)
      .where(eq(submissionsTable.userId, userId));

    const languages = await db
      .select({
        name: languagesTable.name,
        slug: languagesTable.slug,
        solved: countDistinct(submissionsTable.problemId),
      })
      .from(submissionsTable)
      .innerJoin(languagesTable, eq(submissionsTable.languageId, languagesTable.id))
      .where(
        and(
          eq(submissionsTable.userId, userId),
          eq(submissionsTable.status, "accepted"),
        ),
      )
      .groupBy(languagesTable.id, languagesTable.name, languagesTable.slug)
      .orderBy(desc(countDistinct(submissionsTable.problemId)));

    const topics = await db
      .select({
        name: topicsTable.name,
        slug: topicsTable.slug,
        solved: countDistinct(userProblemStatusTable.problemId),
      })
      .from(userProblemStatusTable)
      .innerJoin(
        problemTopicsTable,
        eq(problemTopicsTable.problemId, userProblemStatusTable.problemId),
      )
      .innerJoin(topicsTable, eq(topicsTable.id, problemTopicsTable.topicId))
      .where(
        and(
          eq(userProblemStatusTable.userId, userId),
          eq(userProblemStatusTable.status, "solved"),
        ),
      )
      .groupBy(topicsTable.id, topicsTable.name, topicsTable.slug)
      .orderBy(desc(countDistinct(userProblemStatusTable.problemId)));

    return {
      stats: {
        solved,
        totals,
        totalSubmissions: submissionStats?.total ?? 0,
      },
      languages,
      topics,
    };
  }

  public async getUserProfile(payload: GetUserByIdInputType) {
    const { id } = await getUserByIdInputSchema.parseAsync(payload);

    const [user] = await db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        username: usersTable.username,
        profileImageUrl: usersTable.profileImageUrl,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, id));

    if (!user) {
      throw new Error("User not found");
    }

    const { stats } = await this.buildProfileStats(id);

    return { user, stats };
  }

  public async getUserProfileByUsername(payload: GetUserProfileByUsernameInputType) {
    const { username } =
      await getUserProfileByUsernameInputSchema.parseAsync(payload);

    const [user] = await db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        username: usersTable.username,
        profileImageUrl: usersTable.profileImageUrl,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.username, username));

    if (!user) {
      throw new Error("User not found");
    }

    const { stats, languages, topics } = await this.buildProfileStats(user.id);

    return { user, stats, languages, topics };
  }

  public async listUsers(payload: ListUsersInputType) {
    const { limit, offset, search } =
      await listUsersInputSchema.parseAsync(payload);

    const filter = search
      ? or(
          ilike(usersTable.username, `%${search}%`),
          ilike(usersTable.email, `%${search}%`),
        )
      : undefined;

    const users = await db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        username: usersTable.username,
        email: usersTable.email,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(filter)
      .orderBy(desc(usersTable.createdAt))
      .limit(limit)
      .offset(offset);

    return { users };
  }

  public async updateUserRole(payload: UpdateUserRoleInputType) {
    const { id, role } = await updateUserRoleInputSchema.parseAsync(payload);

    const [user] = await db
      .update(usersTable)
      .set({ role })
      .where(eq(usersTable.id, id))
      .returning();

    if (!user) {
      throw new Error("User not found");
    }

    return { user };
  }

  public async deleteUser(payload: GetUserByIdInputType) {
    const { id } = await getUserByIdInputSchema.parseAsync(payload);

    const [deleted] = await db
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning({ id: usersTable.id });

    if (!deleted) {
      throw new Error("User not found");
    }

    return { success: true };
  }
}

export default UserService;
