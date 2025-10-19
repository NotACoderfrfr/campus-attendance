"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const chatWithAI = action({
  args: {
    roll_number: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    
    console.log("=== AI Chat Debug Info ===");
    console.log("API Key exists:", !!apiKey);
    console.log("API Key length:", apiKey?.length || 0);
    console.log("API Key prefix:", apiKey ? apiKey.substring(0, 10) + "..." : "NOT FOUND");
    
    if (!apiKey) {
      console.error("Gemini API key not configured");
      return {
        success: false,
        message: "AI service is not configured. Please add GEMINI_API_KEY to your environment variables in the Backend section of API Keys.",
      };
    }

    try {
      // Get student's attendance data
      const attendanceSummary = await ctx.runQuery(api.attendance.getAttendanceSummary, {
        roll_number: args.roll_number,
      });

      const dailyTrend = await ctx.runQuery(api.attendance.getDailyAttendanceTrend, {
        roll_number: args.roll_number,
      });

      const totalHeld: number = attendanceSummary.reduce((sum: number, s: any) => sum + s.periods_held, 0);
      const totalAttended: number = attendanceSummary.reduce((sum: number, s: any) => sum + s.periods_attended, 0);
      const overallPercentage: number = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 0;

      // Prepare context for AI
      const attendanceContext: string = `
Student Attendance Data:
- Overall Attendance: ${overallPercentage}% (${totalAttended}/${totalHeld} periods)
- Weekly Schedule: Monday: 6 periods, Tuesday: 6 periods, Wednesday: 5 periods, Thursday: 6 periods, Friday: 4 periods, Saturday: 4 periods, Sunday: 0 periods
- Total periods per week: 31

Subject-wise breakdown:
${attendanceSummary.map((s: any) => `  - ${s.subject}: ${s.percentage}% (${s.periods_attended}/${s.periods_held} periods)`).join('\n')}

Recent attendance trend (last ${dailyTrend.length} days):
${dailyTrend.slice(-7).map((d: any) => `  - ${d.date}: ${d.percentage}%`).join('\n')}

You are an attendance assistant. Answer the student's questions about their attendance accurately based on this data. 
Be helpful, concise, and provide actionable advice. Use the weekly schedule for calculations.
`;

      const prompt = `${attendanceContext}\n\nStudent Question: ${args.message}`;

      console.log("Making Gemini API request...");
      console.log("Using endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent");
      
      const response: Response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
          }),
        }
      );

      console.log("Gemini Response Status:", response.status);
      console.log("Gemini Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error details:", {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
        });
        
        if (response.status === 401 || response.status === 403) {
          return {
            success: false,
            message: "Invalid API key. Please check your Gemini API key configuration.",
            error: `${response.status} - API key is invalid or doesn't have permission`,
          };
        }
        
        if (response.status === 429) {
          return {
            success: false,
            message: "Rate limit exceeded. Please try again in a moment.",
            error: "429 Too Many Requests",
          };
        }
        
        return {
          success: false,
          message: `AI service error (${response.status}). Please try again in a moment.`,
          error: errorText,
        };
      }

      const data: any = await response.json();
      console.log("Gemini Response received successfully");
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        console.error("Unexpected Gemini response format:", JSON.stringify(data));
        return {
          success: false,
          message: "I received an unexpected response. Please try again.",
          error: "Invalid response format from Gemini",
        };
      }

      const aiMessage = data.candidates[0].content.parts[0].text;

      console.log("AI response successful");
      return {
        success: true,
        message: aiMessage,
      };
    } catch (error) {
      console.error("AI chat error (caught exception):", error);
      return {
        success: false,
        message: "Sorry, I couldn't process your question. Please try again.",
        error: String(error),
      };
    }
  },
});