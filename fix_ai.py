with open('src/convex/ai.ts', 'r') as f:
    content = f.read()

# Find and replace the placeholder section
old_section = '''      // --- ATTENDANCE DEPENDENCIES REMOVED TO PREVENT CRASH ---
      // These variables are set to 0/empty to ensure the code below runs without error.
      const overallPercentage: number = 0;
      const totalAttended: number = 0;
      const totalHeld: number = 0;
      const periodsNeededFor75: number = 0;
      const maxBunkablePeriods: number = 0;
      const daysCount: number = 0;
      const bunkDays: number = 0;
      const attendanceSummary: any[] = [];
      // --- END REMOVED BLOCK ---'''

new_section = '''      // Fetch real attendance data
      const attendanceData = await ctx.runQuery(api.attendance.getAttendance, {
        roll_number: args.roll_number,
      });
      
      const summaryData = await ctx.runQuery(api.attendance.getAttendanceSummary, {
        roll_number: args.roll_number,
      });

      const overallPercentage = attendanceData?.overall_percentage || 0;
      const totalAttended = attendanceData?.total_attended || 0;
      const totalHeld = attendanceData?.total_held || 0;
      const periodsNeededFor75 = attendanceData?.periods_needed_for_75 || 0;
      const maxBunkablePeriods = attendanceData?.max_bunkable_periods || 0;
      const daysCount = attendanceData?.days_count || 0;
      const bunkDays = attendanceData?.bunk_days || 0;
      const attendanceSummary = summaryData || [];'''

content = content.replace(old_section, new_section)

# Also need to uncomment the api import at the top
content = content.replace('// import { api } from "./_generated/api"; // NOTE: api import is no longer needed', 'import { api } from "./_generated/api";')

with open('src/convex/ai.ts', 'w') as f:
    f.write(content)

print("✅ Fixed ai.ts - now fetching real attendance data!")
