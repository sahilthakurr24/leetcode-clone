import db, { eq } from "@repo/database";
import {
  markAttendanceSchema,
  MarkAttendanceType,
  getUserAttendanceSchema,
  GetUserAttendanceType,
} from "./model";
import { attendanceTable } from "@repo/database/schema";

class AttendanceService {
  private getDate() {
    return new Date().toISOString().split("T")[0]!;
  }
  public async markAttendance(payload: MarkAttendanceType) {
    const { userId, solved } = await markAttendanceSchema.parseAsync(payload);

    const date = this.getDate();

    const [result] = await db
      .insert(attendanceTable)
      .values({
        userId,
        attendanceDate: date,
        solved,
      })
      .onConflictDoNothing({
        target: [attendanceTable.userId, attendanceTable.attendanceDate],
      })
      .returning({ id: attendanceTable.id });

    return {
      id: result?.id,
    };
  }

  public async getUserAttendance(payload: GetUserAttendanceType) {
    const { userId } = await getUserAttendanceSchema.parseAsync(payload);

    const attendance = await db
      .select({
        attendanceDate: attendanceTable.attendanceDate,
        solved: attendanceTable.solved,
      })
      .from(attendanceTable)
      .where(eq(attendanceTable.userId, userId));

    return { attendance };
  }
}

export default AttendanceService;
