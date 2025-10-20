"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
// import { api } from "./_generated/api"; // NOTE: api import is no longer needed

export const chatWithAI = action({
  args: {
    roll_number: v.string(),
    message: v.string(),
    student_name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        message: "AI service is not configured (Missing GROQ_API_KEY).",
      };
    }

    try {
      // --- ATTENDANCE DEPENDENCIES REMOVED TO PREVENT CRASH ---
      // These variables are set to 0/empty to ensure the code below runs without error.
      const overallPercentage: number = 0;
      const totalAttended: number = 0;
      const totalHeld: number = 0;
      const periodsNeededFor75: number = 0;
      const maxBunkablePeriods: number = 0;
      const daysCount: number = 0;
      const bunkDays: number = 0;
      const attendanceSummary: any[] = [];
      // --- END REMOVED BLOCK ---
      
      const studentName = args.student_name || "Student";
      
      const rollEnding = args.roll_number.slice(-3);
      const rollNumeric = parseInt(rollEnding);
      const batch = rollNumeric >= 1 && rollNumeric <= 45 ? "Batch 1" : "Batch 2";
      
      const now = new Date();
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const currentDayName = days[now.getDay()];
      const currentDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDayName = days[tomorrow.getDay()];

      const scheduleBatch1 = {
        Monday: ["M-IT", "DM", "BDE", "PYT", "DS", "F&A"],
        Tuesday: ["F&A", "DM", "BDE", "PYT", "PYT LAB (2 periods)"],
        Wednesday: ["PYT", "DS", "BDE", "F&A", "DM"],
        Thursday: ["M-IT", "F&A", "DM", "DS", "DS LAB (2 periods)"],
        Friday: ["F&A", "M-IT", "DS", "PYT"],
        Saturday: ["BDE", "M-IT", "BDE LAB (2 periods)"],
        Sunday: []
      };

      const scheduleBatch2 = {
        Monday: ["M-IT", "DM", "BDE", "PYT", "DS", "F&A"],
        Tuesday: ["F&A", "DM", "BDE", "PYT", "DS LAB (2 periods)"],
        Wednesday: ["PYT", "DS", "BDE", "F&A", "DM"],
        Thursday: ["M-IT", "F&A", "DM", "DS", "BDE LAB (2 periods)"],
        Friday: ["F&A", "M-IT", "DS", "PYT"],
        Saturday: ["BDE", "M-IT", "PYT LAB (2 periods)"],
        Sunday: []
      };

      const schedule = batch === "Batch 1" ? scheduleBatch1 : scheduleBatch2;
      const todayClasses = schedule[currentDayName as keyof typeof schedule] || [];
      const tomorrowClasses = schedule[tomorrowDayName as keyof typeof schedule] || [];

      const periodCounts: {[key: string]: number} = {
        Monday: 6, Tuesday: 6, Wednesday: 5, Thursday: 6, Friday: 4, Saturday: 4, Sunday: 0
      };

      const attendanceContext = `
=== YOUR ROLE ===
You are a friendly, intelligent AI assistant embedded in an attendance tracking app. You can:
- Answer attendance-related questions using the data provided
- Have casual conversations and answer general questions
- Provide study tips, motivation, and advice
- Discuss college life, subjects, and academics
- Be helpful, empathetic, and conversational

You are NOT limited to just attendance topics - feel free to chat naturally!

=== IMPORTANT RULES ===
1. For attendance calculations: ALWAYS use the exact numbers provided below (don't calculate yourself)
2. Address the student as "${studentName}" when it feels natural
3. Be concise but friendly (2-4 sentences usually)
4. Use **bold** for important numbers
5. Understand broken English, typos, and informal language
6. Respond in clear, proper English

=== STUDENT DATA ===
Name: ${studentName}
Roll: ${args.roll_number} (ending: ${rollEnding})
Batch: ${batch}
Current Attendance: **${overallPercentage}%** (${totalAttended}/${totalHeld} periods) - NOTE: Data is temporarily unavailable.

=== PRE-CALCULATED ATTENDANCE METRICS ===
Days to reach 75%: ${daysCount} days (${periodsNeededFor75} periods)
Days you can bunk: ${bunkDays} days (${maxBunkablePeriods} periods)

⚠️ When asked about these metrics, use ONLY these numbers. Don't recalculate!

=== CURRENT INFO ===
Today: ${currentDayName}, ${currentDate}
Tomorrow: ${tomorrowDayName}

Today's classes (${periodCounts[currentDayName]} periods):
${todayClasses.length > 0 ? todayClasses.map((s, i) => `${i+1}. ${s}`).join('\n') : 'No classes'}

Tomorrow's classes (${periodCounts[tomorrowDayName]} periods):
${tomorrowClasses.length > 0 ? tomorrowClasses.map((s, i) => `${i+1}. ${s}`).join('\n') : 'No classes'}

=== WEEKLY SCHEDULE (${batch}) ===
Mon (6): M-IT, DM, BDE, PYT, DS, F&A
Tue (6): F&A, DM, BDE, PYT, ${batch === "Batch 1" ? "PYT LAB" : "DS LAB"}
Wed (5): PYT, DS, BDE, F&A, DM
Thu (6): M-IT, F&A, DM, DS, ${batch === "Batch 1" ? "DS LAB" : "BDE LAB"}
Fri (4): F&A, M-IT, DS, PYT
Sat (4): BDE, M-IT, ${batch === "Batch 1" ? "BDE LAB" : "PYT LAB"}
Sun: No classes

=== SUBJECT-WISE ATTENDANCE ===
${attendanceSummary.map((s: any) => `${s.subject}: ${s.percentage}% (${s.periods_attended}/${s.periods_held})`).join('\n') || 'Attendance data unavailable.'}

=== CONVERSATION GUIDELINES ===
- For attendance questions: Use the data above
- For general questions: Answer naturally based on your knowledge
- For study tips: Be encouraging and practical
- For casual chat: Be friendly and engaging
- Don't be overly formal - chat like a helpful friend!
- **Inform the user that attendance data is currently unavailable if they ask for details.**

Subjects full names:
M-IT = Mathematics for IT, DM = Discrete Mathematics, BDE = Big Data Engineering
PYT = Python Programming, DS = Data Structures, F&A = Finance & Accounting
`;

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
            max_tokens: 400,
          }),
        }
      );

      if (!response.ok) {
        return {
          success: false,
          message: "AI service temporarily unavailable.",
        };
      }

      const data: any = await response.json();
      const aiMessage = data.choices[0].message.content;

      return {
        success: true,
        message: aiMessage,
      };
    } catch (error) {
      return {
        success: false,
        message: "Sorry, I couldn't process your question.",
      };
    }
  },
});
