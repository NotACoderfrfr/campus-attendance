import { v } from "convex/values";
import { query } from "./_generated/server";

// Helper function to get Monday of a given date
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

// Helper function to get Sunday of a given date
function getSunday(date: Date): Date {
  const monday = getMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
}

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export const getWeeklyStats = query({
  args: {
    roll_number: v.string(),
  },
  handler: async (ctx, args) => {
    const today = new Date();
    const currentMonday = getMonday(today);
    const currentSunday = getSunday(today);
    
    // Previous week
    const previousMonday = new Date(currentMonday);
    previousMonday.setDate(currentMonday.getDate() - 7);
    const previousSunday = new Date(previousMonday);
    previousSunday.setDate(previousMonday.getDate() + 6);

    // Get all attendance records
    const allRecords = await ctx.db
      .query("attendanceRecords")
      .withIndex("by_roll_number", (q) => q.eq("roll_number", args.roll_number))
      .collect();

    // Filter current week records
    const currentWeekRecords = allRecords.filter((record) => {
      const recordDate = new Date(record.date);
      return recordDate >= currentMonday && recordDate <= today;
    });

    // Filter previous week records
    const previousWeekRecords = allRecords.filter((record) => {
      const recordDate = new Date(record.date);
      return recordDate >= previousMonday && recordDate <= previousSunday;
    });

    // Calculate current week stats
    let currentWeekHeld = 0;
    let currentWeekAttended = 0;
    const currentWeekSubjects = new Map<string, { held: number; attended: number }>();

    currentWeekRecords.forEach((record) => {
      currentWeekHeld += record.periods_held;
      currentWeekAttended += record.periods_attended;

      const existing = currentWeekSubjects.get(record.subject) || { held: 0, attended: 0 };
      currentWeekSubjects.set(record.subject, {
        held: existing.held + record.periods_held,
        attended: existing.attended + record.periods_attended,
      });
    });

    const currentWeekPercentage = currentWeekHeld > 0 
      ? Math.round((currentWeekAttended / currentWeekHeld) * 10000) / 100 
      : 0;

    // Calculate previous week stats
    let previousWeekHeld = 0;
    let previousWeekAttended = 0;

    previousWeekRecords.forEach((record) => {
      previousWeekHeld += record.periods_held;
      previousWeekAttended += record.periods_attended;
    });

    const previousWeekPercentage = previousWeekHeld > 0 
      ? Math.round((previousWeekAttended / previousWeekHeld) * 10000) / 100 
      : 0;

    // Calculate percentage change
    const percentageChange = previousWeekPercentage > 0 
      ? Math.round((currentWeekPercentage - previousWeekPercentage) * 100) / 100 
      : 0;

    // Days left in current week
    const daysLeftInWeek = Math.max(0, Math.ceil((currentSunday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    // Subject-wise breakdown
    const subjectBreakdown = Array.from(currentWeekSubjects.entries()).map(([subject, data]) => ({
      subject,
      periods_held: data.held,
      periods_attended: data.attended,
      percentage: data.held > 0 ? Math.round((data.attended / data.held) * 10000) / 100 : 0,
    }));

    return {
      weekRange: {
        start: formatDate(currentMonday),
        end: formatDate(currentSunday),
        startDisplay: currentMonday.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        endDisplay: currentSunday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      },
      currentWeek: {
        periods_held: currentWeekHeld,
        periods_attended: currentWeekAttended,
        percentage: currentWeekPercentage,
      },
      previousWeek: {
        percentage: previousWeekPercentage,
      },
      percentageChange,
      daysLeftInWeek,
      subjectBreakdown,
    };
  },
});
