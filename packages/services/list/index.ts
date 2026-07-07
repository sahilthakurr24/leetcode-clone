import { db, eq, and, asc, desc, max } from "@repo/database";
import {
  problemListsTable,
  problemListItemsTable,
  favoritesTable,
  problemsTable,
} from "@repo/database/schema";
import {
  createListInputSchema,
  CreateListInputType,
  getUserListsInputSchema,
  GetUserListsInputType,
  getListByIdInputSchema,
  GetListByIdInputType,
  deleteListInputSchema,
  DeleteListInputType,
  listItemInputSchema,
  ListItemInputType,
  toggleFavoriteInputSchema,
  ToggleFavoriteInputType,
  getUserFavoritesInputSchema,
  GetUserFavoritesInputType,
} from "./model";

class ListService {
  public async createList(payload: CreateListInputType) {
    const { userId, name, description, isPublic } =
      await createListInputSchema.parseAsync(payload);

    const [list] = await db
      .insert(problemListsTable)
      .values({ userId, name, description, isPublic })
      .returning();

    return { list };
  }

  public async getUserLists(payload: GetUserListsInputType) {
    const { userId } = await getUserListsInputSchema.parseAsync(payload);

    const lists = await db
      .select()
      .from(problemListsTable)
      .where(eq(problemListsTable.userId, userId))
      .orderBy(desc(problemListsTable.createdAt));

    return { lists };
  }

  public async getListById(payload: GetListByIdInputType) {
    const { id } = await getListByIdInputSchema.parseAsync(payload);

    const [list] = await db
      .select()
      .from(problemListsTable)
      .where(eq(problemListsTable.id, id));

    if (!list) {
      throw new Error("List not found");
    }

    const items = await db
      .select({
        problemId: problemListItemsTable.problemId,
        position: problemListItemsTable.position,
        addedAt: problemListItemsTable.addedAt,
        slug: problemsTable.slug,
        title: problemsTable.title,
        difficulty: problemsTable.difficulty,
      })
      .from(problemListItemsTable)
      .innerJoin(
        problemsTable,
        eq(problemListItemsTable.problemId, problemsTable.id),
      )
      .where(eq(problemListItemsTable.listId, id))
      .orderBy(asc(problemListItemsTable.position));

    return { list, items };
  }

  public async deleteList(payload: DeleteListInputType) {
    const { id, userId } = await deleteListInputSchema.parseAsync(payload);

    const [deleted] = await db
      .delete(problemListsTable)
      .where(
        and(eq(problemListsTable.id, id), eq(problemListsTable.userId, userId)),
      )
      .returning({ id: problemListsTable.id });

    if (!deleted) {
      throw new Error("List not found");
    }

    return { success: true };
  }

  public async addProblemToList(payload: ListItemInputType) {
    const { listId, problemId, userId } =
      await listItemInputSchema.parseAsync(payload);

    await this.assertListOwnership(listId, userId);

    const [row] = await db
      .select({ maxPosition: max(problemListItemsTable.position) })
      .from(problemListItemsTable)
      .where(eq(problemListItemsTable.listId, listId));

    const [item] = await db
      .insert(problemListItemsTable)
      .values({ listId, problemId, position: (row?.maxPosition ?? 0) + 1 })
      .onConflictDoNothing()
      .returning();

    if (!item) {
      throw new Error("Problem is already in the list");
    }

    return { item };
  }

  public async removeProblemFromList(payload: ListItemInputType) {
    const { listId, problemId, userId } =
      await listItemInputSchema.parseAsync(payload);

    await this.assertListOwnership(listId, userId);

    const [deleted] = await db
      .delete(problemListItemsTable)
      .where(
        and(
          eq(problemListItemsTable.listId, listId),
          eq(problemListItemsTable.problemId, problemId),
        ),
      )
      .returning({ problemId: problemListItemsTable.problemId });

    if (!deleted) {
      throw new Error("Problem is not in the list");
    }

    return { success: true };
  }

  public async toggleFavorite(payload: ToggleFavoriteInputType) {
    const { userId, problemId } =
      await toggleFavoriteInputSchema.parseAsync(payload);

    const [existing] = await db
      .select()
      .from(favoritesTable)
      .where(
        and(
          eq(favoritesTable.userId, userId),
          eq(favoritesTable.problemId, problemId),
        ),
      );

    if (existing) {
      await db
        .delete(favoritesTable)
        .where(
          and(
            eq(favoritesTable.userId, userId),
            eq(favoritesTable.problemId, problemId),
          ),
        );
      return { favorited: false };
    }

    await db.insert(favoritesTable).values({ userId, problemId });
    return { favorited: true };
  }

  public async getUserFavorites(payload: GetUserFavoritesInputType) {
    const { userId } = await getUserFavoritesInputSchema.parseAsync(payload);

    const favorites = await db
      .select({
        problemId: favoritesTable.problemId,
        createdAt: favoritesTable.createdAt,
        slug: problemsTable.slug,
        title: problemsTable.title,
        difficulty: problemsTable.difficulty,
      })
      .from(favoritesTable)
      .innerJoin(problemsTable, eq(favoritesTable.problemId, problemsTable.id))
      .where(eq(favoritesTable.userId, userId))
      .orderBy(desc(favoritesTable.createdAt));

    return { favorites };
  }

  private async assertListOwnership(listId: string, userId: string) {
    const [list] = await db
      .select({ id: problemListsTable.id })
      .from(problemListsTable)
      .where(
        and(
          eq(problemListsTable.id, listId),
          eq(problemListsTable.userId, userId),
        ),
      );

    if (!list) {
      throw new Error("List not found");
    }
  }
}

export default ListService;
