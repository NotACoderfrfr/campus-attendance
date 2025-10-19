import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all attendance records for a student
export const getAttendance = query({
  args: {
    roll_number: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("attendanceRecords")
      .withIndex("by_roll_number", (q) => q.eq("roll_number", args.roll_number))
      .collect();
  },
});

// Get attendance summary by subject
export const getAttendanceSummary = query({
  args: {
    roll_number: v.string(),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("attendanceRecords")
      .withIndex("by_roll_number", (q) => q.eq("roll_number", args.roll_number))
      .collect();

    // Group by subject
    const subjectMap = new Map<string, { held: number; attended: number; lastUpdated: number }>();

    records.forEach((record) => {
      const existing = subjectMap.get(record.subject) || { held: 0, attended: 0, lastUpdated: 0 };
      subjectMap.set(record.subject, {
        held: existing.held + record.periods_held,
        attended: existing.attended + record.periods_attended,
        lastUpdated: Math.max(existing.lastUpdated, record.timestamp),
      });
    });

    return Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      periods_held: data.held,
      periods_attended: data.attended,
      percentage: data.held > 0 ? Math.round((data.attended / data.held) * 10000) / 100 : 0,
      lastUpdated: data.lastUpdated,
    }));
  },
});

// Get attendance history (all records sorted by date)
export const getAttendanceHistory = query({
  args: {
    roll_number: v.string(),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("attendanceRecords")
      .withIndex("by_roll_number", (q) => q.eq("roll_number", args.roll_number));

    const records = await query.collect();

    // Filter by date if provided
    const filtered = args.date
      ? records.filter((r) => r.date === args.date)
      : records;

    // Sort by date descending
    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  },
});

// Get daily attendance percentage trend
export const getDailyAttendanceTrend = query({
  args: {
    roll_number: v.string(),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("attendanceRecords")
      .withIndex("by_roll_number", (q) => q.eq("roll_number", args.roll_number))
      .collect();

    // Group by date and calculate cumulative attendance
    const dateMap = new Map<string, { held: number; attended: number }>();

    records.forEach((record) => {
      const existing = dateMap.get(record.date) || { held: 0, attended: 0 };
      dateMap.set(record.date, {
        held: existing.held + record.periods_held,
        attended: existing.attended + record.periods_attended,
      });
    });

    // Sort by date and calculate cumulative percentages
    const sortedDates = Array.from(dateMap.entries()).sort((a, b) => 
      a[0].localeCompare(b[0])
    );

    let cumulativeHeld = 0;
    let cumulativeAttended = 0;

    const trend = sortedDates.map(([date, data]) => {
      cumulativeHeld += data.held;
      cumulativeAttended += data.attended;
      const percentage = cumulativeHeld > 0 
        ? Math.round((cumulativeAttended / cumulativeHeld) * 10000) / 100 
        : 0;

      return {
        date,
        percentage,
        held: cumulativeHeld,
        attended: cumulativeAttended,
      };
    });

    return trend;
  },
});

// Update or create attendance record
export const updateAttendance = mutation({
  args: {
    roll_number: v.string(),
    subject: v.string(),
    date: v.string(),
    periods_held: v.number(),
    periods_attended: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if record exists
    const existing = await ctx.db
      .query("attendanceRecords")
      .withIndex("by_roll_number_and_subject_and_date", (q) =>
        q.eq("roll_number", args.roll_number)
          .eq("subject", args.subject)
          .eq("date", args.date)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        periods_held: args.periods_held,
        periods_attended: args.periods_attended,
        timestamp: Date.now(),
      });
      return await ctx.db.get(existing._id);
    } else {
      const id = await ctx.db.insert("attendanceRecords", {
        roll_number: args.roll_number,
        subject: args.subject,
        date: args.date,
        periods_held: args.periods_held,
        periods_attended: args.periods_attended,
        timestamp: Date.now(),
      });
      return await ctx.db.get(id);
    }
  },
});

// Increment attendance (held or attended)
export const incrementAttendance = mutation({
  args: {
    roll_number: v.string(),
    subject: v.string(),
    date: v.string(),
    field: v.union(v.literal("held"), v.literal("attended")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("attendanceRecords")
      .withIndex("by_roll_number_and_subject_and_date", (q) =>
        q.eq("roll_number", args.roll_number)
          .eq("subject", args.subject)
          .eq("date", args.date)
      )
      .unique();

    if (existing) {
      const update =
        args.field === "held"
          ? { periods_held: existing.periods_held + 1 }
          : { periods_attended: existing.periods_attended + 1 };

      await ctx.db.patch(existing._id, {
        ...update,
        timestamp: Date.now(),
      });
      return await ctx.db.get(existing._id);
    } else {
      // Create new record
      const id = await ctx.db.insert("attendanceRecords", {
        roll_number: args.roll_number,
        subject: args.subject,
        date: args.date,
        periods_held: args.field === "held" ? 1 : 0,
        periods_attended: args.field === "attended" ? 1 : 0,
        timestamp: Date.now(),
      });
      return await ctx.db.get(id);
    }
  },
});

// Decrement attendance
export const decrementAttendance = mutation({
  args: {
    roll_number: v.string(),
    subject: v.string(),
    date: v.string(),
    field: v.union(v.literal("held"), v.literal("attended")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("attendanceRecords")
      .withIndex("by_roll_number_and_subject_and_date", (q) =>
        q.eq("roll_number", args.roll_number)
          .eq("subject", args.subject)
          .eq("date", args.date)
      )
      .unique();

    if (!existing) {
      throw new Error("Attendance record not found");
    }

    const currentValue =
      args.field === "held" ? existing.periods_held : existing.periods_attended;

    if (currentValue <= 0) {
      throw new Error("Cannot decrement below 0");
    }

    const update =
      args.field === "held"
        ? { periods_held: existing.periods_held - 1 }
        : { periods_attended: existing.periods_attended - 1 };

    await ctx.db.patch(existing._id, {
      ...update,
      timestamp: Date.now(),
    });

    return await ctx.db.get(existing._id);
  },
});

// Add subject manually
export const addSubjectManual = mutation({
  args: {
    roll_number: v.string(),
    subject: v.string(),
    date: v.string(),
    periods_held: v.number(),
    periods_attended: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("attendanceRecords", {
      roll_number: args.roll_number,
      subject: args.subject,
      date: args.date,
      periods_held: args.periods_held,
      periods_attended: args.periods_attended,
      timestamp: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

// Import Excel data (bulk insert)
export const importExcel = mutation({
  args: {
    roll_number: v.string(),
    records: v.array(
      v.object({
        subject: v.string(),
        date: v.string(),
        periods_held: v.number(),
        periods_attended: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results = [];

    for (const record of args.records) {
      // Check if exists
      const existing = await ctx.db
        .query("attendanceRecords")
        .withIndex("by_roll_number_and_subject_and_date", (q) =>
          q.eq("roll_number", args.roll_number)
            .eq("subject", record.subject)
            .eq("date", record.date)
        )
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          periods_held: record.periods_held,
          periods_attended: record.periods_attended,
          timestamp: Date.now(),
        });
        results.push(await ctx.db.get(existing._id));
      } else {
        const id = await ctx.db.insert("attendanceRecords", {
          roll_number: args.roll_number,
          subject: record.subject,
          date: record.date,
          periods_held: record.periods_held,
          periods_attended: record.periods_attended,
          timestamp: Date.now(),
        });
        results.push(await ctx.db.get(id));
      }
    }

    return results;
  },
});

// Delete all attendance records for a specific subject
export const deleteSubject = mutation({
  args: {
    roll_number: v.string(),
    subject: v.string(),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("attendanceRecords")
      .withIndex("by_roll_number_and_subject", (q) =>
        q.eq("roll_number", args.roll_number).eq("subject", args.subject)
      )
      .collect();

    for (const record of records) {
      await ctx.db.delete(record._id);
    }

    return { deleted: records.length };
  },
});

// Decrement total (works across all dates)
export const decrementTotal = mutation({
  args: {
    roll_number: v.string(),
    subject: v.string(),
    field: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("=== DECREMENT CALLED ===");
    console.log("Roll:", args.roll_number);
    console.log("Subject:", args.subject);
    
    const allRecords = await ctx.db
      .query("attendanceRecords")
      .filter((q) =>
        q.and(
          q.eq(q.field("roll_number"), args.roll_number),
          q.eq(q.field("subject"), args.subject)
        )
      )
      .collect();

    console.log("Records found:", allRecords.length);
    
    if (allRecords.length === 0) {
      const allSubjects = await ctx.db
        .query("attendanceRecords")
        .filter((q) => q.eq(q.field("roll_number"), args.roll_number))
        .collect();
      
      console.log("All subjects:", allSubjects.map(r => r.subject));
      throw new Error(`No records for "${args.subject}". Available: ${allSubjects.map(r => r.subject).join(", ")}`);
    }

    const latestRecord = allRecords.sort((a, b) => b.timestamp - a.timestamp)[0];
    console.log("Latest record:", latestRecord);
    
    let newHeld = latestRecord.periods_held;
    let newAttended = latestRecord.periods_attended;

    if (args.field === "held") {
      newHeld = Math.max(0, latestRecord.periods_held - 1);
      newAttended = Math.min(latestRecord.periods_attended, newHeld);
    } else {
      newAttended = Math.max(0, latestRecord.periods_attended - 1);
    }

    console.log("Updating from:", { held: latestRecord.periods_held, attended: latestRecord.periods_attended });
    console.log("Updating to:", { held: newHeld, attended: newAttended });

    await ctx.db.patch(latestRecord._id, {
      periods_held: newHeld,
      periods_attended: newAttended,
      timestamp: Date.now(),
    });

    console.log("=== DONE ===");
    return { success: true, newHeld, newAttended };
  },
});
