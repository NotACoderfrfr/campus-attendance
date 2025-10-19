import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const bulkImport = mutation({
  args: {
    data: v.any()
  },
  handler: async (ctx, args) => {
    const data = args.data;
    
    // Clear ALL existing data
    console.log("Clearing old data...");
    
    const oldStudents = await ctx.db.query("students").collect();
    for (const s of oldStudents) await ctx.db.delete(s._id);
    
    const oldRecords = await ctx.db.query("attendanceRecords").collect();
    for (const r of oldRecords) await ctx.db.delete(r._id);
    
    const oldAchievements = await ctx.db.query("achievements").collect();
    for (const a of oldAchievements) await ctx.db.delete(a._id);
    
    const oldStreaks = await ctx.db.query("streaks").collect();
    for (const s of oldStreaks) await ctx.db.delete(s._id);
    
    // Import students
    console.log("Importing students...");
    for (const student of data.students || []) {
      const { _id, _creationTime, ...rest } = student;
      await ctx.db.insert("students", rest);
    }
    
    // Import attendance records
    console.log("Importing attendance records...");
    for (const record of data.attendanceRecords || []) {
      const { _id, _creationTime, ...rest } = record;
      await ctx.db.insert("attendanceRecords", rest);
    }
    
    // Import achievements
    for (const achievement of data.achievements || []) {
      const { _id, _creationTime, ...rest } = achievement;
      await ctx.db.insert("achievements", rest);
    }
    
    // Import streaks
    for (const streak of data.streaks || []) {
      const { _id, _creationTime, ...rest } = streak;
      await ctx.db.insert("streaks", rest);
    }
    
    return {
      success: true,
      studentsImported: data.students?.length || 0,
      recordsImported: data.attendanceRecords?.length || 0,
      achievementsImported: data.achievements?.length || 0,
      streaksImported: data.streaks?.length || 0
    };
  },
});
