import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Register a new student
export const register = mutation({
  args: {
    name: v.string(),
    roll_number: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if roll number already exists
    const existing = await ctx.db
      .query("students")
      .withIndex("by_roll_number", (q) => q.eq("roll_number", args.roll_number))
      .unique();

    if (existing) {
      throw new Error("Roll number already registered");
    }

    const studentId = await ctx.db.insert("students", {
      name: args.name,
      roll_number: args.roll_number,
      created_at: Date.now(),
    });

    return await ctx.db.get(studentId);
  },
});

// Login - verify student exists
export const login = mutation({
  args: {
    roll_number: v.string(),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db
      .query("students")
      .withIndex("by_roll_number", (q) => q.eq("roll_number", args.roll_number))
      .unique();

    if (!student) {
      throw new Error("Student not found. Please register first.");
    }

    return student;
  },
});

// Get all students with attendance summary
export const getAllStudents = query({
  args: {},
  handler: async (ctx) => {
    const students = await ctx.db.query("students").collect();
    
    const studentsWithSummary = await Promise.all(
      students.map(async (student) => {
        const records = await ctx.db
          .query("attendanceRecords")
          .withIndex("by_roll_number", (q) => q.eq("roll_number", student.roll_number))
          .collect();

        const totalHeld = records.reduce((sum, r) => sum + r.periods_held, 0);
        const totalAttended = records.reduce((sum, r) => sum + r.periods_attended, 0);
        const percentage = totalHeld > 0 ? (totalAttended / totalHeld) * 100 : 0;

        return {
          ...student,
          totalHeld,
          totalAttended,
          percentage: Math.round(percentage * 100) / 100,
        };
      })
    );

    return studentsWithSummary;
  },
});

// Get single student by roll number
export const getStudent = query({
  args: {
    roll_number: v.string(),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db
      .query("students")
      .withIndex("by_roll_number", (q) => q.eq("roll_number", args.roll_number))
      .unique();

    if (!student) {
      return null;
    }

    const records = await ctx.db
      .query("attendanceRecords")
      .withIndex("by_roll_number", (q) => q.eq("roll_number", args.roll_number))
      .collect();

    const totalHeld = records.reduce((sum, r) => sum + r.periods_held, 0);
    const totalAttended = records.reduce((sum, r) => sum + r.periods_attended, 0);
    const percentage = totalHeld > 0 ? (totalAttended / totalHeld) * 100 : 0;

    return {
      ...student,
      totalHeld,
      totalAttended,
      percentage: Math.round(percentage * 100) / 100,
    };
  },
});

// Get all students with phone numbers (internal query for SMS)
export const getStudentsWithPhones = query({
  args: {},
  handler: async (ctx) => {
    const students = await ctx.db.query("students").collect();
    return students.filter(s => s.phone_number && s.phone_number.trim() !== "");
  },
});

// Update student phone number
export const updatePhoneNumber = mutation({
  args: {
    roll_number: v.string(),
    phone_number: v.string(),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db
      .query("students")
      .withIndex("by_roll_number", (q) => q.eq("roll_number", args.roll_number))
      .unique();

    if (!student) {
      throw new Error("Student not found");
    }

    await ctx.db.patch(student._id, {
      phone_number: args.phone_number,
    });

    return await ctx.db.get(student._id);
  },
});