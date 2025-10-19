import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get action history for a student
export const getActionHistory = query({
  args: {
    roll_number: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    const actions = await ctx.db
      .query("action_history")
      .withIndex("by_roll_number", (q) => q.eq("roll_number", args.roll_number))
      .order("desc")
      .take(limit);
    
    return actions;
  },
});

// Get last undoable action
export const getLastUndoableAction = query({
  args: {
    roll_number: v.string(),
  },
  handler: async (ctx, args) => {
    const actions = await ctx.db
      .query("action_history")
      .withIndex("by_roll_number", (q) => q.eq("roll_number", args.roll_number))
      .order("desc")
      .take(1);
    
    return actions.find(a => !a.undone) || null;
  },
});

// Undo an action
export const undoAction = mutation({
  args: {
    action_id: v.id("action_history"),
  },
  handler: async (ctx, args) => {
    const action = await ctx.db.get(args.action_id);
    
    if (!action) {
      throw new Error("Action not found");
    }
    
    if (action.undone) {
      throw new Error("Action already undone");
    }
    
    // Restore previous values
    const previousValues = action.previous_value as Array<{
      subject: string;
      date: string;
      periods_held: number;
      periods_attended: number;
    } | null>;
    
    for (const prevValue of previousValues) {
      if (prevValue) {
        // Find the record
        const existing = await ctx.db
          .query("attendanceRecords")
          .withIndex("by_roll_number_and_subject_and_date", (q) =>
            q.eq("roll_number", action.roll_number)
              .eq("subject", prevValue.subject)
              .eq("date", prevValue.date)
          )
          .unique();
        
        if (existing) {
          await ctx.db.patch(existing._id, {
            periods_held: prevValue.periods_held,
            periods_attended: prevValue.periods_attended,
            timestamp: Date.now(),
          });
        }
      } else {
        // Previous value was null, meaning record didn't exist - delete it
        const newValues = action.new_value as Array<{
          subject: string;
          date: string;
        }>;
        
        for (const newVal of newValues) {
          const toDelete = await ctx.db
            .query("attendanceRecords")
            .withIndex("by_roll_number_and_subject_and_date", (q) =>
              q.eq("roll_number", action.roll_number)
                .eq("subject", newVal.subject)
                .eq("date", newVal.date)
            )
            .unique();
          
          if (toDelete) {
            await ctx.db.delete(toDelete._id);
          }
        }
      }
    }
    
    // Mark as undone
    await ctx.db.patch(args.action_id, {
      undone: true,
    });
    
    return { success: true, action };
  },
});

// Redo an action
export const redoAction = mutation({
  args: {
    action_id: v.id("action_history"),
  },
  handler: async (ctx, args) => {
    const action = await ctx.db.get(args.action_id);
    
    if (!action) {
      throw new Error("Action not found");
    }
    
    if (!action.undone) {
      throw new Error("Action is not undone");
    }
    
    // Apply new values
    const newValues = action.new_value as Array<{
      subject: string;
      date: string;
      periods_held: number;
      periods_attended: number;
    }>;
    
    for (const newValue of newValues) {
      const existing = await ctx.db
        .query("attendanceRecords")
        .withIndex("by_roll_number_and_subject_and_date", (q) =>
          q.eq("roll_number", action.roll_number)
            .eq("subject", newValue.subject)
            .eq("date", newValue.date)
        )
        .unique();
      
      if (existing) {
        await ctx.db.patch(existing._id, {
          periods_held: newValue.periods_held,
          periods_attended: newValue.periods_attended,
          timestamp: Date.now(),
        });
      } else {
        await ctx.db.insert("attendanceRecords", {
          roll_number: action.roll_number,
          subject: newValue.subject,
          date: newValue.date,
          periods_held: newValue.periods_held,
          periods_attended: newValue.periods_attended,
          timestamp: Date.now(),
        });
      }
    }
    
    // Mark as not undone
    await ctx.db.patch(args.action_id, {
      undone: false,
    });
    
    return { success: true, action };
  },
});
