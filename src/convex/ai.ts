"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const chatWithAI = action({
  args: {
    roll_number: v.string(),
    message: v.string(),
    student_name: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        message: "AI service is not configured.",
      };
    }

    try {
      // Fetch real attendance data with timeout
      const summaryData: any[] = await Promise.race([
        ctx.runQuery(api.attendance.getAttendanceSummary, {
          roll_number: args.roll_number,
        }),
        new Promise<any[]>((_, reject) => 
          setTimeout(() => reject(new Error("Query timeout")), 5000)
        )
      ]);

      // Calculate overall attendance
      let totalAttended = 0;
      let totalHeld = 0;
      
      summaryData.forEach((subject: any) => {
        // Labs count as 2 periods each
        const isLab = subject.subject?.toLowerCase().includes('lab');
        const multiplier = isLab ? 2 : 1;
        
        totalAttended += subject.periods_attended * multiplier;
        totalHeld += subject.periods_held * multiplier;
      });

      const overallPercentage: number = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 0;
      
      const targetPercentage = 75;
      const periodsNeededFor75: number = overallPercentage < targetPercentage
        ? Math.ceil((targetPercentage * totalHeld - 100 * totalAttended) / (100 - targetPercentage))
        : 0;
      
      const maxBunkablePeriods: number = overallPercentage >= targetPercentage
        ? Math.floor((100 * totalAttended - targetPercentage * totalHeld) / targetPercentage)
        : 0;
      
      const daysCount: number = Math.ceil(periodsNeededFor75 / 5);
      const bunkDays: number = Math.floor(maxBunkablePeriods / 5);
      
      const attendanceSummary: any[] = summaryData || [];
      const studentName: string = args.student_name || "Student";
      
      const rollEnding: string = args.roll_number.slice(-3);
      const rollNumeric: number = parseInt(rollEnding);
      const batch: string = rollNumeric >= 1 && rollNumeric <= 45 ? "Batch 1" : "Batch 2";
      
      const now = new Date();
      const days: string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const currentDayName: string = days[now.getDay()];
      
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDayName: string = days[tomorrow.getDay()];

      const scheduleBatch1: Record<string, string[]> = {
        Monday: ["M-IT", "DM", "BDE", "PYT", "DS", "F&A"],
        Tuesday: ["F&A", "DM", "BDE", "PYT", "PYT LAB"],
        Wednesday: ["PYT", "DS", "BDE", "F&A", "DM"],
        Thursday: ["M-IT", "F&A", "DM", "DS", "DS LAB"],
        Friday: ["F&A", "M-IT", "DS", "PYT"],
        Saturday: ["BDE", "M-IT", "BDE LAB"],
        Sunday: []
      };

      const scheduleBatch2: Record<string, string[]> = {
        Monday: ["M-IT", "DM", "BDE", "PYT", "DS", "F&A"],
        Tuesday: ["F&A", "DM", "BDE", "PYT", "DS LAB"],
        Wednesday: ["PYT", "DS", "BDE", "F&A", "DM"],
        Thursday: ["M-IT", "F&A", "DM", "DS", "BDE LAB"],
        Friday: ["F&A", "M-IT", "DS", "PYT"],
        Saturday: ["BDE", "M-IT", "PYT LAB"],
        Sunday: []
      };

      const schedule: Record<string, string[]> = batch === "Batch 1" ? scheduleBatch1 : scheduleBatch2;
      const todayClasses: string[] = schedule[currentDayName] || [];
      const tomorrowClasses: string[] = schedule[tomorrowDayName] || [];

      // Simplified context to avoid timeouts
      const attendanceContext: string = `You are a friendly AI assistant. Answer concisely.

Student: ${studentName} (${args.roll_number}, ${batch})
Attendance: ${overallPercentage}% (${totalAttended}/${totalHeld})
To reach 75%: ${daysCount} days
Can bunk: ${bunkDays} days

Today (${currentDayName}): ${todayClasses.join(', ') || 'No classes'}
Tomorrow (${tomorrowDayName}): ${tomorrowClasses.join(', ') || 'No classes'}

Subjects: ${attendanceSummary.map((s: any) => `${s.subject}: ${s.percentage}%`).join(', ')}`;

      // Call GROQ with shorter timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response: Response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: attendanceContext },
              { role: "user", content: args.message },
            ],
            temperature: 0.7,
            max_tokens: 300, // Reduced for faster responses
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText: string = await response.text();
        console.error("GROQ API Error:", response.status, errorText);
        return {
          success: false,
          message: "AI is busy. Please try again!",
        };
      }

      const data: any = await response.json();
      const aiMessage: string = data.choices?.[0]?.message?.content || "Sorry, couldn't generate response.";

      return {
        success: true,
        message: aiMessage,
      };
    } catch (error: any) {
      console.error("Chat AI Error:", error.message);
      
      if (error.message === "Query timeout" || error.name === "AbortError") {
        return {
          success: false,
          message: "Request timed out. Please try again!",
        };
      }
      
      return {
        success: false,
        message: "Something went wrong. Try again!",
      };
    }
  },
});
