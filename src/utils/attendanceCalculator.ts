export interface AttendanceRecord {
  sessionType: "lecture" | "lab" | "tutorial";
  status: "present" | "absent" | "late";
}

export const calculateAttendance = (records: AttendanceRecord[]) => {
  let totalPeriods = 0;
  let presentPeriods = 0;
  let absentPeriods = 0;

  records.forEach(record => {
    const periodMultiplier = record.sessionType === "lab" ? 2 : 1;
    totalPeriods += periodMultiplier;
    
    if (record.status === "present") {
      presentPeriods += periodMultiplier;
    } else if (record.status === "absent") {
      absentPeriods += periodMultiplier;
    }
  });

  return {
    total: totalPeriods,
    present: presentPeriods,
    absent: absentPeriods,
    percentage: totalPeriods > 0 ? (presentPeriods / totalPeriods) * 100 : 0
  };
};
