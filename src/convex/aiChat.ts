import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const askAttendanceQuestion = action({
  args: {
    question: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get student's attendance data
    const student = await ctx.runQuery(api.students.getByUserId, { userId: args.userId });
    
    if (!student) {
      return { answer: "I couldn't find your attendance data. Please make sure you're logged in." };
    }

    // Get all attendance records for this student
    const records = await ctx.runQuery(api.attendanceRecords.getByStudentId, { 
      studentId: student._id 
    });

    // Prepare context for AI
    const attendanceContext = {
      studentName: student.name,
      totalSubjects: student.subjects?.length || 0,
      subjects: student.subjects || [],
      attendanceRecords: records.length,
      overallPercentage: calculateOverallPercentage(student.subjects || []),
    };

    // Call Gemini API (we'll do this in frontend for now since Convex actions have limitations)
    return { 
      answer: "Processing...",
      context: attendanceContext,
      records: records.slice(0, 50) // Last 50 records
    };
  },
});

function calculateOverallPercentage(subjects: any[]) {
  if (!subjects.length) return 0;
  const total = subjects.reduce((sum, sub) => sum + (sub.present + sub.absent), 0);
  const present = subjects.reduce((sum, sub) => sum + sub.present, 0);
  return total > 0 ? Math.round((present / total) * 100) : 0;
}
