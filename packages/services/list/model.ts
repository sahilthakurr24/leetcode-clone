import { z } from "zod";

export const createListInputSchema = z.object({
  userId: z.string().describe("Id of the owner"),
  name: z.string().min(1).max(120),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export type CreateListInputType = z.infer<typeof createListInputSchema>;

export const getUserListsInputSchema = z.object({
  userId: z.string().describe("Id of the user"),
});

export type GetUserListsInputType = z.infer<typeof getUserListsInputSchema>;

export const getListByIdInputSchema = z.object({
  id: z.string().describe("Id of the list"),
});

export type GetListByIdInputType = z.infer<typeof getListByIdInputSchema>;

export const deleteListInputSchema = z.object({
  id: z.string().describe("Id of the list"),
  userId: z.string().describe("Id of the owner"),
});

export type DeleteListInputType = z.infer<typeof deleteListInputSchema>;

export const listItemInputSchema = z.object({
  listId: z.string().describe("Id of the list"),
  problemId: z.string().describe("Id of the problem"),
  userId: z.string().describe("Id of the owner"),
});

export type ListItemInputType = z.infer<typeof listItemInputSchema>;

export const toggleFavoriteInputSchema = z.object({
  userId: z.string().describe("Id of the user"),
  problemId: z.string().describe("Id of the problem"),
});

export type ToggleFavoriteInputType = z.infer<
  typeof toggleFavoriteInputSchema
>;

export const getUserFavoritesInputSchema = z.object({
  userId: z.string().describe("Id of the user"),
});

export type GetUserFavoritesInputType = z.infer<
  typeof getUserFavoritesInputSchema
>;
