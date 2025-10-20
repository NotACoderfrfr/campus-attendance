with open('src/convex/ai.ts', 'r') as f:
    content = f.read()

# Find and replace the broken section
old_section = '''      // Fetch real attendance data
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

new_section = '''      // Fetch real attendance data
      const summaryData = await ctx.runQuery(api.attendance.getAttendanceSummary, {
        roll_number: args.roll_number,
      });

      // Calculate overall attendance
      let totalAttended = 0;
      let totalHeld = 0;
      
      summaryData.forEach((subject: any) => {
        totalAttended += subject.periods_attended;
        totalHeld += subject.periods_held;
      });

      const overallPercentage = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 0;
      
      // Calculate periods needed for 75%
      const targetPercentage = 75;
      const periodsNeededFor75 = overallPercentage < targetPercentage
        ? Math.ceil((targetPercentage * totalHeld - 100 * totalAttended) / (100 - targetPercentage))
        : 0;
      
      // Calculate max bunkable periods
      const maxBunkablePeriods = overallPercentage >= targetPercentage
        ? Math.floor((100 * totalAttended - targetPercentage * totalHeld) / targetPercentage)
        : 0;
      
      // Estimate days (assuming ~5 periods per day)
      const daysCount = Math.ceil(periodsNeededFor75 / 5);
      const bunkDays = Math.floor(maxBunkablePeriods / 5);
      
      const attendanceSummary = summaryData || [];'''

content = content.replace(old_section, new_section)

with open('src/convex/ai.ts', 'w') as f:
    f.write(content)

print("✅ Fixed ai.ts with proper calculations!")
