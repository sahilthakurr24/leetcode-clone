import z from "zod";

const roleSchema = z.enum(["user", "admin"]);

export const getUserByUsernameInputSchema = z.object({
  username: z.string().min(1).describe("Username of the user"),
});

export const isUsernameAvailableInputSchema = z.object({
  username: z.string().min(3).max(50).describe("Username to check for availability"),
});

export const getUserProfileInputSchema = z.object({
  id: z.string().uuid().describe("Id of the user"),
});

export const updateMyProfileInputSchema = z.object({
  fullName: z.string().min(1).max(80).optional(),
  username: z.string().min(3).max(50).optional(),
  profileImageUrl: z.string().url().optional(),
});

export const listUsersInputSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().optional().describe("Match against username or email"),
});

export const updateUserRoleInputSchema = z.object({
  id: z.string().uuid().describe("Id of the user"),
  role: roleSchema,
});

export const deleteUserInputSchema = z.object({
  id: z.string().uuid().describe("Id of the user"),
});

/** Full user row — only ever returned to the user themselves or admins. */
const privateUserRowSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  username: z.string().nullable(),
  email: z.string(),
  emailVerified: z.boolean(),
  profileImageUrl: z.string().nullable(),
  role: roleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

/** Public view of a user — no email. */
const publicUserSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  username: z.string().nullable(),
  profileImageUrl: z.string().nullable(),
  role: roleSchema,
  createdAt: z.date(),
});

export const meOutputSchema = z.object({
  user: privateUserRowSchema,
});

export const getUserByUsernameOutputSchema = z.object({
  user: publicUserSchema,
});

export const isUsernameAvailableOutputSchema = z.object({
  available: z.boolean(),
});

export const getUserProfileOutputSchema = z.object({
  user: publicUserSchema,
  stats: z.object({
    solved: z.object({
      easy: z.number().int(),
      medium: z.number().int(),
      hard: z.number().int(),
      total: z.number().int(),
    }),
    totalSubmissions: z.number().int(),
  }),
});

export const updateMyProfileOutputSchema = z.object({
  user: privateUserRowSchema,
});

export const listUsersOutputSchema = z.object({
  users: z.array(
    z.object({
      id: z.string().uuid(),
      fullName: z.string(),
      username: z.string().nullable(),
      email: z.string(),
      role: roleSchema,
      createdAt: z.date(),
    }),
  ),
});
