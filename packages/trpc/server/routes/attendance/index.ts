import z from "zod";

import { attendanceService } from "../../services";
import { zodUndefinedModel } from "../../schema";
import { autheticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

const TAGS = ["Attendance"];
const getPath = generatePath("/attendance");

export const getMyAttendanceOutputSchema = z.object({
  attendance: z.array(
    z.object({
      // `date` column — serialized as a "YYYY-MM-DD" string.
      attendanceDate: z.string(),
      solved: z.boolean(),
    }),
  ),
});

export const attendanceRouter = router({
  getMyAttendance: autheticatedProcedure
    .meta({ openapi: { method: "GET", path: getPath("mine"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(getMyAttendanceOutputSchema)
    .query(({ ctx }) => attendanceService.getUserAttendance({ userId: ctx.userId })),
});
