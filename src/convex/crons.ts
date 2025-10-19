import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Schedule SMS reminders at specified times (IST timezone)
// 10:30 AM
crons.cron("attendance_reminder_1030", "30 5 * * 1-6", internal.sms.sendAttendanceReminders, {});

// 11:30 AM
crons.cron("attendance_reminder_1130", "30 6 * * 1-6", internal.sms.sendAttendanceReminders, {});

// 12:30 PM
crons.cron("attendance_reminder_1230", "30 7 * * 1-6", internal.sms.sendAttendanceReminders, {});

// 1:20 PM
crons.cron("attendance_reminder_0120", "20 7 * * 1-6", internal.sms.sendAttendanceReminders, {});

// 3:20 PM
crons.cron("attendance_reminder_0320", "20 9 * * 1-6", internal.sms.sendAttendanceReminders, {});

// 4:20 PM
crons.cron("attendance_reminder_0420", "20 10 * * 1-6", internal.sms.sendAttendanceReminders, {});

export default crons;
