"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const exportAllData = action({
  args: {
    roll_number: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    const students: any = await ctx.runQuery(internal.dataExportQueries.getAllStudentsInternal, {
      roll_number: args.roll_number,
    });

    const attendanceRecords: any = await ctx.runQuery(internal.dataExportQueries.getAllAttendanceInternal, {
      roll_number: args.roll_number,
    });

    const achievements: any = await ctx.runQuery(internal.dataExportQueries.getAllAchievementsInternal, {
      roll_number: args.roll_number,
    });

    const streaks: any = await ctx.runQuery(internal.dataExportQueries.getAllStreaksInternal, {
      roll_number: args.roll_number,
    });

    const actionHistory: any = await ctx.runQuery(internal.dataExportQueries.getAllActionHistoryInternal, {
      roll_number: args.roll_number,
    });

    return {
      metadata: {
        exportDate: new Date().toISOString(),
        exportedBy: args.roll_number || "all_students",
        totalStudents: students.length,
        totalAttendanceRecords: attendanceRecords.length,
        totalAchievements: achievements.length,
        totalStreaks: streaks.length,
        totalActionHistory: actionHistory.length,
      },
      students,
      attendanceRecords,
      achievements,
      streaks,
      actionHistory,
    };
  },
});
