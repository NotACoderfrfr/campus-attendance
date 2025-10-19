import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

// Get all achievements for a student
export const getAchievements = query({
  args: {
    roll_number: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("achievements")
      .withIndex("by_roll_number", (q) => q.eq("roll_number", args.roll_number))
      .collect();
  },
});

// Get streak data for a student
export const getStreak = query({
  args: {
    roll_number: v.string(),
  },
  handler: async (ctx, args) => {
    const streak = await ctx.db
      .query("streaks")
      .withIndex("by_roll_number", (q) => q.eq("roll_number", args.roll_number))
      .unique();

    return streak || { current_streak: 0, longest_streak: 0, last_updated: "" };
  },
});

// Unlock an achievement
export const unlockAchievement = mutation({
  args: {
    roll_number: v.string(),
    achievement_type: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already unlocked
    const existing = await ctx.db
      .query("achievements")
      .withIndex("by_roll_number_and_type", (q) =>
        q.eq("roll_number", args.roll_number).eq("achievement_type", args.achievement_type)
      )
      .unique();

    if (existing) {
      return existing;
    }

    const today = new Date().toISOString().split("T")[0];
    const id = await ctx.db.insert("achievements", {
      roll_number: args.roll_number,
      achievement_type: args.achievement_type,
      unlocked_date: today,
      timestamp: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

// Update streak
export const updateStreak = mutation({
  args: {
    roll_number: v.string(),
    overall_percentage: v.number(),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    
    const existing = await ctx.db
      .query("streaks")
      .withIndex("by_roll_number", (q) => q.eq("roll_number", args.roll_number))
      .unique();

    let newCurrentStreak = 0;
    let newLongestStreak = 0;

    if (existing) {
      const lastDate = new Date(existing.last_updated);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (args.overall_percentage >= 75) {
        if (daysDiff === 1) {
          // Consecutive day
          newCurrentStreak = existing.current_streak + 1;
        } else if (daysDiff === 0) {
          // Same day update
          newCurrentStreak = existing.current_streak;
        } else {
          // Streak broken, restart
          newCurrentStreak = 1;
        }
      } else {
        // Below 75%, reset streak
        newCurrentStreak = 0;
      }

      newLongestStreak = Math.max(existing.longest_streak, newCurrentStreak);

      await ctx.db.patch(existing._id, {
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_updated: today,
      });

      return await ctx.db.get(existing._id);
    } else {
      // Create new streak record
      newCurrentStreak = args.overall_percentage >= 75 ? 1 : 0;
      newLongestStreak = newCurrentStreak;

      const id = await ctx.db.insert("streaks", {
        roll_number: args.roll_number,
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_updated: today,
      });

      return await ctx.db.get(id);
    }
  },
});

// Check and unlock achievements based on current stats
export const checkAchievements = mutation({
  args: {
    roll_number: v.string(),
    overall_percentage: v.number(),
    subject_percentages: v.array(v.object({
      subject: v.string(),
      percentage: v.number(),
    })),
    current_streak: v.number(),
  },
  handler: async (ctx, args) => {
    const unlocked = [];

    // First Step - already has attendance records
    const records = await ctx.db
      .query("attendanceRecords")
      .withIndex("by_roll_number", (q) => q.eq("roll_number", args.roll_number))
      .collect();
    
    if (records.length > 0) {
      const existing = await ctx.db
        .query("achievements")
        .withIndex("by_roll_number_and_type", (q) =>
          q.eq("roll_number", args.roll_number).eq("achievement_type", "first_step")
        )
        .unique();
      
      if (!existing) {
        const today = new Date().toISOString().split("T")[0];
        await ctx.db.insert("achievements", {
          roll_number: args.roll_number,
          achievement_type: "first_step",
          unlocked_date: today,
          timestamp: Date.now(),
        });
        unlocked.push("first_step");
      }
    }

    // Week Warrior - 7 day streak
    if (args.current_streak >= 7) {
      const existing = await ctx.db
        .query("achievements")
        .withIndex("by_roll_number_and_type", (q) =>
          q.eq("roll_number", args.roll_number).eq("achievement_type", "week_warrior")
        )
        .unique();
      
      if (!existing) {
        const today = new Date().toISOString().split("T")[0];
        await ctx.db.insert("achievements", {
          roll_number: args.roll_number,
          achievement_type: "week_warrior",
          unlocked_date: today,
          timestamp: Date.now(),
        });
        unlocked.push("week_warrior");
      }
    }

    // Month Master - 30 day streak
    if (args.current_streak >= 30) {
      const existing = await ctx.db
        .query("achievements")
        .withIndex("by_roll_number_and_type", (q) =>
          q.eq("roll_number", args.roll_number).eq("achievement_type", "month_master")
        )
        .unique();
      
      if (!existing) {
        const today = new Date().toISOString().split("T")[0];
        await ctx.db.insert("achievements", {
          roll_number: args.roll_number,
          achievement_type: "month_master",
          unlocked_date: today,
          timestamp: Date.now(),
        });
        unlocked.push("month_master");
      }
    }

    // Perfect Subject - 95%+ in any subject
    const hasPerfectSubject = args.subject_percentages.some(s => s.percentage >= 95);
    if (hasPerfectSubject) {
      const existing = await ctx.db
        .query("achievements")
        .withIndex("by_roll_number_and_type", (q) =>
          q.eq("roll_number", args.roll_number).eq("achievement_type", "perfect_subject")
        )
        .unique();
      
      if (!existing) {
        const today = new Date().toISOString().split("T")[0];
        await ctx.db.insert("achievements", {
          roll_number: args.roll_number,
          achievement_type: "perfect_subject",
          unlocked_date: today,
          timestamp: Date.now(),
        });
        unlocked.push("perfect_subject");
      }
    }

    // Attendance Hero - 90%+ overall
    if (args.overall_percentage >= 90) {
      const existing = await ctx.db
        .query("achievements")
        .withIndex("by_roll_number_and_type", (q) =>
          q.eq("roll_number", args.roll_number).eq("achievement_type", "attendance_hero")
        )
        .unique();
      
      if (!existing) {
        const today = new Date().toISOString().split("T")[0];
        await ctx.db.insert("achievements", {
          roll_number: args.roll_number,
          achievement_type: "attendance_hero",
          unlocked_date: today,
          timestamp: Date.now(),
        });
        unlocked.push("attendance_hero");
      }
    }

    return unlocked;
  },
});
