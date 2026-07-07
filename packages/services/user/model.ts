import { z } from "zod";

export const getAuthenticationMethodOutputSchema = z.object({
  provider: z.enum(["GOOGLE_OAUTH"]),
  displayName: z.string().optional(),
  displayText: z.string().optional(),
  authUrl: z.string(),
});
export type GetAuthenticationMethodOutputSchema = z.infer<
  typeof getAuthenticationMethodOutputSchema
>;

export const getUserByIdInputSchema = z.object({
  id: z.string().describe("Id of the user"),
});

export type GetUserByIdInputType = z.infer<typeof getUserByIdInputSchema>;

export const getUserByUsernameInputSchema = z.object({
  username: z.string().describe("Username of the user"),
});

export type GetUserByUsernameInputType = z.infer<
  typeof getUserByUsernameInputSchema
>;

export const isUsernameAvailableInputSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(50)
    .describe("Username to check for availability"),
});

export type IsUsernameAvailableInputType = z.infer<
  typeof isUsernameAvailableInputSchema
>;

export const updateUserProfileInputSchema = z.object({
  id: z.string().describe("Id of the user"),
  fullName: z.string().min(1).max(80).optional(),
  username: z.string().min(3).max(50).optional(),
  profileImageUrl: z.string().url().optional(),
});

export type UpdateUserProfileInputType = z.infer<
  typeof updateUserProfileInputSchema
>;

export const listUsersInputSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
  search: z.string().optional().describe("Match against username or email"),
});

export type ListUsersInputType = z.infer<typeof listUsersInputSchema>;

export const updateUserRoleInputSchema = z.object({
  id: z.string().describe("Id of the user"),
  role: z.enum(["user", "admin"]),
});

export type UpdateUserRoleInputType = z.infer<typeof updateUserRoleInputSchema>;
