import { listService } from "../../services";
import { successOutputSchema, zodUndefinedModel } from "../../schema";
import { autheticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  createListInputSchema,
  createListOutputSchema,
  getMyListsOutputSchema,
  getListByIdInputSchema,
  getListByIdOutputSchema,
  deleteListInputSchema,
  listItemInputSchema,
  addProblemToListOutputSchema,
  toggleFavoriteInputSchema,
  toggleFavoriteOutputSchema,
  getMyFavoritesOutputSchema,
} from "./model";

const TAGS = ["List"];
const getPath = generatePath("/list");

export const listRouter = router({
  createList: autheticatedProcedure
    .meta({ openapi: { method: "POST", path: getPath("create"), tags: TAGS } })
    .input(createListInputSchema)
    .output(createListOutputSchema)
    .mutation(({ ctx, input }) =>
      listService.createList({ ...input, userId: ctx.userId }),
    ),

  getMyLists: autheticatedProcedure
    .meta({ openapi: { method: "GET", path: getPath("mine"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(getMyListsOutputSchema)
    .query(({ ctx }) => listService.getUserLists({ userId: ctx.userId })),

  getListById: autheticatedProcedure
    .meta({ openapi: { method: "GET", path: getPath("{id}"), tags: TAGS } })
    .input(getListByIdInputSchema)
    .output(getListByIdOutputSchema)
    .query(({ input }) => listService.getListById(input)),

  deleteList: autheticatedProcedure
    .meta({ openapi: { method: "POST", path: getPath("delete"), tags: TAGS } })
    .input(deleteListInputSchema)
    .output(successOutputSchema)
    .mutation(({ ctx, input }) =>
      listService.deleteList({ ...input, userId: ctx.userId }),
    ),

  addProblemToList: autheticatedProcedure
    .meta({ openapi: { method: "POST", path: getPath("add-problem"), tags: TAGS } })
    .input(listItemInputSchema)
    .output(addProblemToListOutputSchema)
    .mutation(({ ctx, input }) =>
      listService.addProblemToList({ ...input, userId: ctx.userId }),
    ),

  removeProblemFromList: autheticatedProcedure
    .meta({ openapi: { method: "POST", path: getPath("remove-problem"), tags: TAGS } })
    .input(listItemInputSchema)
    .output(successOutputSchema)
    .mutation(({ ctx, input }) =>
      listService.removeProblemFromList({ ...input, userId: ctx.userId }),
    ),

  toggleFavorite: autheticatedProcedure
    .meta({ openapi: { method: "POST", path: getPath("toggle-favorite"), tags: TAGS } })
    .input(toggleFavoriteInputSchema)
    .output(toggleFavoriteOutputSchema)
    .mutation(({ ctx, input }) =>
      listService.toggleFavorite({ ...input, userId: ctx.userId }),
    ),

  getMyFavorites: autheticatedProcedure
    .meta({ openapi: { method: "GET", path: getPath("favorites"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(getMyFavoritesOutputSchema)
    .query(({ ctx }) => listService.getUserFavorites({ userId: ctx.userId })),
});
