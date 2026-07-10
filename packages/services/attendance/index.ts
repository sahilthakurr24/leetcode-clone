import db from "@repo/database";
import { markAttendanceSchema, MarkAttendanceType } from "./model";
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
}

export default AttendanceService;
