import z from "zod";

export const markAttendanceSchema = z.object({
  userId: z.string().describe("Id of the user"),
  solved: z.boolean().describe("Tells if user solved a problem or not"),
});


export type MarkAttendanceType = z.infer<typeof markAttendanceSchema>;

export const getUserAttendanceSchema = z.object({
  userId: z.string().describe("Id of the user"),
});

export type GetUserAttendanceType = z.infer<typeof getUserAttendanceSchema>;