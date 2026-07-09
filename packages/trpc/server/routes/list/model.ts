import z from "zod";

import { difficultySchema } from "../../schema";

export const createListInputSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export const getListByIdInputSchema = z.object({
  id: z.string().uuid().describe("Id of the list"),
});

export const deleteListInputSchema = z.object({
  id: z.string().uuid().describe("Id of the list"),
});

export const listItemInputSchema = z.object({
  listId: z.string().uuid().describe("Id of the list"),
  problemId: z.string().uuid().describe("Id of the problem"),
});

export const toggleFavoriteInputSchema = z.object({
  problemId: z.string().uuid().describe("Id of the problem"),
});

const listRowSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  isPublic: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/** Problem summary joined into list items / favorites. */
const problemSummaryFields = {
  problemId: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  difficulty: difficultySchema,
};

export const createListOutputSchema = z.object({
  list: listRowSchema.optional(),
});

export const getMyListsOutputSchema = z.object({
  lists: z.array(listRowSchema),
});

export const getListByIdOutputSchema = z.object({
  list: listRowSchema,
  items: z.array(
    z.object({
      ...problemSummaryFields,
      position: z.number().int(),
      addedAt: z.date(),
    }),
  ),
});

export const addProblemToListOutputSchema = z.object({
  item: z.object({
    listId: z.string().uuid(),
    problemId: z.string().uuid(),
    position: z.number().int(),
    addedAt: z.date(),
  }),
});

export const toggleFavoriteOutputSchema = z.object({
  favorited: z.boolean(),
});

export const getMyFavoritesOutputSchema = z.object({
  favorites: z.array(
    z.object({
      ...problemSummaryFields,
      createdAt: z.date(),
    }),
  ),
});
