import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Weekly schedule with batch-specific labs
const WEEKLY_SCHEDULE: Record<string, {
  subjects: string[];
  batchSpecific?: {
    batch1: string[];
    batch2: string[];
  };
  totalPeriods: number;
}> = {
  Monday: {
    subjects: ["M-IT", "DM", "BDE", "PYT", "DS", "F&A"],
    totalPeriods: 6,
  },
  Tuesday: {
    subjects: ["F&A", "DM", "BDE", "PYT"],
    batchSpecific: {
      batch1: ["PYT LAB"],
      batch2: ["DS Lab"],
    },
    totalPeriods: 6,
  },
  Wednesday: {
    subjects: ["PYT", "DS", "BDE", "F&A", "DM"],
    totalPeriods: 5,
  },
  Thursday: {
    subjects: ["M-IT", "F&A", "DM", "DS"],
    batchSpecific: {
      batch1: ["DS Lab"],
      batch2: ["BDE LAB"],
    },
    totalPeriods: 6,
  },
  Friday: {
    subjects: ["F&A", "M-IT", "DS", "PYT"],
    totalPeriods: 4,
  },
  Saturday: {
    subjects: ["BDE", "M-IT"],
    batchSpecific: {
      batch1: ["BDE LAB"],
      batch2: ["PYT LAB"],
    },
    totalPeriods: 4,
  },
  Sunday: {
    subjects: [],
    totalPeriods: 0,
  },
};

// Determine student batch from roll number
export function getStudentBatch(rollNumber: string): "batch1" | "batch2" {
  const lastThreeDigits = parseInt(rollNumber.slice(-3));
  return lastThreeDigits >= 1 && lastThreeDigits <= 45 ? "batch1" : "batch2";
}

// Mark today's attendance for all subjects
export const markTodayAttendance = mutation({
  args: {
    roll_number: v.string(),
    attendance_type: v.union(v.literal("present"), v.literal("absent")),
  },
  handler: async (ctx, args) => {
    const today = new Date();
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
    const dateString = today.toISOString().split("T")[0];
    
    const schedule = WEEKLY_SCHEDULE[dayName];
    
    if (!schedule || schedule.totalPeriods === 0) {
      throw new Error("No classes today");
    }
    
    const batch = getStudentBatch(args.roll_number);
    const subjectsToMark = [...schedule.subjects];
    
    // Add batch-specific lab if applicable
    if (schedule.batchSpecific) {
      const labSubjects = schedule.batchSpecific[batch];
      subjectsToMark.push(...labSubjects);
    }
    
    const changes = [];
    
    for (const subject of subjectsToMark) {
      const isLab = subject.includes("LAB");
      const periodsHeld = isLab ? 2 : 1;
      const periodsAttended = args.attendance_type === "present" ? periodsHeld : 0;
      
      // Check if record exists
      const existing = await ctx.db
        .query("attendanceRecords")
        .withIndex("by_roll_number_and_subject_and_date", (q) =>
          q.eq("roll_number", args.roll_number)
            .eq("subject", subject)
            .eq("date", dateString)
        )
        .unique();
      
      const previousValue = existing ? {
        subject: existing.subject,
        date: existing.date,
        periods_held: existing.periods_held,
        periods_attended: existing.periods_attended,
      } : null;
      
      // Upsert attendance record - ADD to existing values instead of replacing
      if (existing) {
        await ctx.db.patch(existing._id, {
          periods_held: existing.periods_held + periodsHeld,
          periods_attended: existing.periods_attended + periodsAttended,
          timestamp: Date.now(),
        });
      } else {
        await ctx.db.insert("attendanceRecords", {
          roll_number: args.roll_number,
          subject,
          date: dateString,
          periods_held: periodsHeld,
          periods_attended: periodsAttended,
          timestamp: Date.now(),
        });
      }
      
      changes.push({
        subject,
        previousValue,
        newValue: {
          subject,
          date: dateString,
          periods_held: existing ? existing.periods_held + periodsHeld : periodsHeld,
          periods_attended: existing ? existing.periods_attended + periodsAttended : periodsAttended,
        },
      });
    }
    
    // Create action_history entry
    await ctx.db.insert("action_history", {
      roll_number: args.roll_number,
      action_type: args.attendance_type === "present" ? "mark_present" : "mark_absent",
      subject: subjectsToMark.join(", "),
      previous_value: changes.map(c => c.previousValue),
      new_value: changes.map(c => c.newValue),
      timestamp: Date.now(),
      undone: false,
    });
    
    return {
      success: true,
      subjectsMarked: subjectsToMark.length,
      day: dayName,
      subjects: subjectsToMark,
    };
  },
});
