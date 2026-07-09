import { userService } from "../../services";
import { successOutputSchema, zodUndefinedModel } from "../../schema";
import { adminProcedure, autheticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  getUserByUsernameInputSchema,
  getUserByUsernameOutputSchema,
  isUsernameAvailableInputSchema,
  isUsernameAvailableOutputSchema,
  getUserProfileInputSchema,
  getUserProfileOutputSchema,
  updateMyProfileInputSchema,
  updateMyProfileOutputSchema,
  listUsersInputSchema,
  listUsersOutputSchema,
  updateUserRoleInputSchema,
  deleteUserInputSchema,
  meOutputSchema,
} from "./model";

const TAGS = ["User"];
const getPath = generatePath("/user");

export const userRouter = router({
  me: autheticatedProcedure
    .meta({ openapi: { method: "GET", path: getPath("me"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(meOutputSchema)
    .query(({ ctx }) => userService.getUserById({ id: ctx.userId })),

  getUserByUsername: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("by-username/{username}"), tags: TAGS } })
    .input(getUserByUsernameInputSchema)
    .output(getUserByUsernameOutputSchema)
    .query(({ input }) => userService.getUserByUsername(input)),

  isUsernameAvailable: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("username-available"), tags: TAGS } })
    .input(isUsernameAvailableInputSchema)
    .output(isUsernameAvailableOutputSchema)
    .query(({ input }) => userService.isUsernameAvailable(input)),

  getUserProfile: publicProcedure
    .meta({ openapi: { method: "GET", path: getPath("profile/{id}"), tags: TAGS } })
    .input(getUserProfileInputSchema)
    .output(getUserProfileOutputSchema)
    .query(({ input }) => userService.getUserProfile(input)),

  updateMyProfile: autheticatedProcedure
    .meta({ openapi: { method: "POST", path: getPath("update-profile"), tags: TAGS } })
    .input(updateMyProfileInputSchema)
    .output(updateMyProfileOutputSchema)
    .mutation(({ ctx, input }) =>
      userService.updateUserProfile({ ...input, id: ctx.userId }),
    ),

  listUsers: adminProcedure
    .meta({ openapi: { method: "GET", path: getPath("list"), tags: TAGS } })
    .input(listUsersInputSchema)
    .output(listUsersOutputSchema)
    .query(({ input }) => userService.listUsers(input)),

  updateUserRole: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath("update-role"), tags: TAGS } })
    .input(updateUserRoleInputSchema)
    .output(updateMyProfileOutputSchema)
    .mutation(({ input }) => userService.updateUserRole(input)),

  deleteUser: adminProcedure
    .meta({ openapi: { method: "POST", path: getPath("delete"), tags: TAGS } })
    .input(deleteUserInputSchema)
    .output(successOutputSchema)
    .mutation(({ input }) => userService.deleteUser(input)),
});
