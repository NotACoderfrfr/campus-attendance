import { mutation } from "./_generated/server";

export const fixLabRecords = mutation({
  handler: async (ctx) => {
    const allRecords = await ctx.db.query("attendanceRecords").collect();
    let fixed = 0;
    
    for (const record of allRecords) {
      const isLab = record.subject?.toLowerCase().includes('lab');
      
      // If it's a lab but periods_held is 1, fix it
      if (isLab && record.periods_held === 1) {
        await ctx.db.patch(record._id, {
          periods_held: 2,
          periods_attended: record.periods_attended === 1 ? 2 : 0,
        });
        fixed++;
      }
    }
    
    return { fixed, message: `Fixed ${fixed} lab records` };
  },
});
