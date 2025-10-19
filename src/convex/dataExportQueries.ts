import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getAllStudentsInternal = internalQuery({
  args: { roll_number: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.roll_number) {
      const student = await ctx.db
        .query("students")
        .withIndex("by_roll_number", (q) => q.eq("roll_number", args.roll_number as string))
        .unique();
      return student ? [student] : [];
    }
    return await ctx.db.query("students").collect();
  },
});

export const getAllAttendanceInternal = internalQuery({
  args: { roll_number: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.roll_number) {
      return await ctx.db
        .query("attendanceRecords")
        .withIndex("by_roll_number", (q) => q.eq("roll_number", args.roll_number as string))
        .collect();
    }
    return await ctx.db.query("attendanceRecords").collect();
  },
});

export const getAllAchievementsInternal = internalQuery({
  args: { roll_number: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.roll_number) {
      return await ctx.db
        .query("achievements")
        .withIndex("by_roll_number", (q) => q.eq("roll_number", args.roll_number as string))
        .collect();
    }
    return await ctx.db.query("achievements").collect();
  },
});

export const getAllStreaksInternal = internalQuery({
  args: { roll_number: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.roll_number) {
      return await ctx.db
        .query("streaks")
        .withIndex("by_roll_number", (q) => q.eq("roll_number", args.roll_number as string))
        .collect();
    }
    return await ctx.db.query("streaks").collect();
  },
});

export const getAllActionHistoryInternal = internalQuery({
  args: { roll_number: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.roll_number) {
      return await ctx.db
        .query("action_history")
        .withIndex("by_roll_number", (q) => q.eq("roll_number", args.roll_number as string))
        .collect();
    }
    return await ctx.db.query("action_history").collect();
  },
});
