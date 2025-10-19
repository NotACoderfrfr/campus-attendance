"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { api } from "./_generated/api";
import twilio from "twilio";

// Send SMS to a single student
export const sendSMS = action({
  args: {
    to: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error("Twilio credentials not configured");
    }

    const client = twilio(accountSid, authToken);

    try {
      const message = await client.messages.create({
        body: args.message,
        to: args.to,
        from: fromNumber,
      });

      return { success: true, messageSid: message.sid };
    } catch (error) {
      console.error("Error sending SMS:", error);
      return { success: false, error: String(error) };
    }
  },
});

// Send attendance reminders to all students with phone numbers
export const sendAttendanceReminders = internalAction({
  args: {},
  handler: async (ctx) => {
    // Check if today is Sunday (0 = Sunday)
    const today = new Date();
    if (today.getDay() === 0) {
      console.log("Skipping SMS reminders - it's Sunday");
      return { skipped: true, reason: "Sunday" };
    }

    // Get all students with phone numbers (use public query via api)
    const students = await ctx.runQuery(api.students.getStudentsWithPhones, {});

    const message =
      "⏰ Reminder: Please update your attendance for this period. Don't forget to mark your attendance accurately!";

    // Add explicit typing to avoid implicit any errors
    const results: Array<{
      student: string;
      success: boolean;
      messageSid?: string;
      error?: string;
    }> = [];

    for (const student of students) {
      if (student.phone_number) {
        try {
          // Call the public action via api to avoid internal circular refs
          const result = await ctx.runAction(api.sms.sendSMS, {
            to: student.phone_number,
            message,
          });
          results.push({ student: student.name, ...result });
        } catch (error) {
          results.push({
            student: student.name,
            success: false,
            error: String(error),
          });
        }
      }
    }

    return { sent: results.length, results };
  },
});