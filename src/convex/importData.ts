import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const clearAndImport = mutation({
  args: {
    students: v.array(v.any()),
    records: v.array(v.any())
  },
  handler: async (ctx, args) => {
    // Delete old test data
    const oldStudents = await ctx.db.query("students").collect();
    for (const s of oldStudents) {
      await ctx.db.delete(s._id);
    }
    
    const oldRecords = await ctx.db.query("attendanceRecords").collect();
    for (const r of oldRecords) {
      await ctx.db.delete(r._id);
    }
    
    // Import new data
    for (const student of args.students) {
      const { _id, _creationTime, ...data } = student;
      await ctx.db.insert("students", data);
    }
    
    for (const record of args.records) {
      const { _id, _creationTime, ...data } = record;
      await ctx.db.insert("attendanceRecords", data);
    }
    
    return {
      students: args.students.length,
      records: args.records.length
    };
  },
});
