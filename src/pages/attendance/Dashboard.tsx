import { authService } from "@/utils/auth";
import AttendanceAIChatbot from "@/components/AttendanceAIChatbot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { motion } from "framer-motion";
import { BookOpen, Calendar, Loader2, Users, TrendingUp, TrendingDown, Coffee, Award, Flame, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { toast } from "sonner";
import { QuickActionsFAB } from "@/components/attendance/QuickActionsFAB";

export default function Dashboard() {
  const navigate = useNavigate();
  const [rollNumber, setRollNumber] = useState<string | null>(authService.getRollNumber());
  const [studentName, setStudentName] = useState<string | null>(authService.getName());

  useEffect(() => {
    if (!rollNumber) {
      navigate("/attendance/login");
    }
  }, [rollNumber, navigate]);

  // Keyboard shortcut for undo (Ctrl+Z / Cmd+Z)
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        
        // This would require importing the mutation and query
        // For now, just show a toast directing to undo history
        toast.info("Press the Quick Actions button to access Undo History", {
          description: "Or navigate to History → Undo from the menu",
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Monday notification
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Check if it's Monday (1) and if we haven't shown the notification today
    if (dayOfWeek === 1) {
      const lastNotificationDate = localStorage.getItem("lastMondayNotification");
      const todayString = today.toISOString().split("T")[0];
      
      if (lastNotificationDate !== todayString) {
        toast.success("New week started! Reset your goals 🎯", {
          duration: 5000,
        });
        localStorage.setItem("lastMondayNotification", todayString);
      }
    }
  }, []);

  const attendanceSummary = useQuery(
    api.attendance.getAttendanceSummary,
    rollNumber ? { roll_number: rollNumber } : "skip"
  );

  const dailyTrend = useQuery(
    api.attendance.getDailyAttendanceTrend,
    rollNumber ? { roll_number: rollNumber } : "skip"
  );

  const streak = useQuery(
    api.achievements.getStreak,
    rollNumber ? { roll_number: rollNumber } : "skip"
  );

  const achievements = useQuery(
    api.achievements.getAchievements,
    rollNumber ? { roll_number: rollNumber } : "skip"
  );

  const updateStreak = useMutation(api.achievements.updateStreak);
  const checkAchievements = useMutation(api.achievements.checkAchievements);

  if (!rollNumber) return null;

  const totalHeld = attendanceSummary?.reduce((sum, s) => sum + s.periods_held, 0) || 0;
  const totalAttended = attendanceSummary?.reduce((sum, s) => sum + s.periods_attended, 0) || 0;
  const overallPercentage = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 0;

  // Update streak when attendance data changes
  useEffect(() => {
    if (rollNumber && overallPercentage !== undefined && attendanceSummary) {
      updateStreak({
        roll_number: rollNumber,
        overall_percentage: overallPercentage,
      }).then(() => {
        // Check achievements after updating streak
        checkAchievements({
          roll_number: rollNumber,
          overall_percentage: overallPercentage,
          subject_percentages: attendanceSummary.map(s => ({
            subject: s.subject,
            percentage: s.percentage,
          })),
          current_streak: streak?.current_streak || 0,
        });
      });
    }
  }, [rollNumber, overallPercentage, attendanceSummary]);

  // Calculate estimate to reach 75% using actual weekly schedule
  const calculateDaysTo75 = () => {
    if (overallPercentage >= 75) return null;

    // Weekly schedule: Mon=6, Tue=6, Wed=5, Thu=6, Fri=4, Sat=4, Sun=0
    const weeklySchedule = [0, 6, 6, 5, 6, 4, 4]; // Sunday=0, Monday=1, etc.

    // To reach 75%, we need: (totalAttended + periodsToAttend) / (totalHeld + periodsToBeHeld) = 0.75
    // Assuming 100% attendance going forward (best case scenario):
    // (totalAttended + periodsToBeHeld) / (totalHeld + periodsToBeHeld) = 0.75
    // Solving for periodsToBeHeld:
    // totalAttended + periodsToBeHeld = 0.75 * (totalHeld + periodsToBeHeld)
    // totalAttended + periodsToBeHeld = 0.75 * totalHeld + 0.75 * periodsToBeHeld
    // periodsToBeHeld - 0.75 * periodsToBeHeld = 0.75 * totalHeld - totalAttended
    // 0.25 * periodsToBeHeld = 0.75 * totalHeld - totalAttended
    // periodsToBeHeld = (0.75 * totalHeld - totalAttended) / 0.25
    
    const periodsNeededWith100Percent = Math.ceil((0.75 * totalHeld - totalAttended) / 0.25);
    
    if (periodsNeededWith100Percent <= 0 || !isFinite(periodsNeededWith100Percent)) return null;

    // Calculate how many days this will take based on weekly schedule
    const today = new Date();
    let currentDay = today.getDay();
    let periodsAccumulated = 0;
    let daysCount = 0;
    const estimatedDate = new Date(today);

    while (periodsAccumulated < periodsNeededWith100Percent && daysCount < 365) {
      daysCount++;
      currentDay = (currentDay + 1) % 7;
      periodsAccumulated += weeklySchedule[currentDay];
      estimatedDate.setDate(estimatedDate.getDate() + 1);
    }

    return {
      days: daysCount,
      date: estimatedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      periodsNeeded: periodsNeededWith100Percent,
      periodsToBeHeld: periodsNeededWith100Percent,
    };
  };

  const estimate = calculateDaysTo75();

  // Format chart data
  const chartData = dailyTrend?.map(item => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    percentage: item.percentage,
  })) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 pb-24"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome, {studentName}!</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Roll Number: {rollNumber}</p>
          </div>
          <Button variant="outline" onClick={() => {
            localStorage.removeItem("studentName");
            localStorage.removeItem("studentRollNumber");
            navigate("/attendance/login");
          }}>
            Logout
          </Button>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallPercentage}%</div>
              <p className="text-xs text-muted-foreground">
                {totalAttended} / {totalHeld} periods
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent" onClick={() => navigate("/attendance/subjects")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceSummary?.length || 0}</div>
              <p className="text-xs text-muted-foreground">View all subjects</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent" onClick={() => navigate("/attendance/achievements")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{streak?.current_streak || 0}</span>
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-xs text-muted-foreground">
                {achievements?.length || 0} badges unlocked
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Trend Graph */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trend</CardTitle>
              <CardDescription>Your attendance percentage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <ReferenceLine y={75} stroke="red" strokeDasharray="3 3" label="75% Target" />
                    <Line 
                      type="monotone" 
                      dataKey="percentage" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Estimate Card */}
              {overallPercentage < 75 && estimate && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">Estimated to reach 75%</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Based on the weekly schedule (Mon-Sat: 6,6,5,6,4,4 periods), you'll reach 75% in approximately{" "}
                        <span className="font-bold">{estimate.days} days</span> (around {estimate.date})
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Out of the next {estimate.periodsToBeHeld} periods to be held, you need to attend approximately {estimate.periodsNeeded} periods
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {overallPercentage >= 75 && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100">Great job! 🎉</h4>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Your attendance is above 75%. Keep up the good work!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Weekly Progress Report - Compact Card with Link */}
        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate("/attendance/weekly-progress")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Progress Report
            </CardTitle>
            <CardDescription>
              View detailed weekly attendance statistics and subject-wise breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              View Weekly Report →
            </Button>
          </CardContent>
        </Card>

        {/* Bunk Calculator Link */}
        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate("/attendance/bunk-calculator")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5" />
              Bunk Calculator
            </CardTitle>
            <CardDescription>
              See how many classes you can skip (or can't) 😏
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Calculate Bunkable Days →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Attendance</CardTitle>
            <CardDescription>Your attendance breakdown by subject</CardDescription>
          </CardHeader>
          <CardContent>
            {!attendanceSummary ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : attendanceSummary.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No attendance records yet</p>
            ) : (
              <div className="space-y-4">
                {attendanceSummary.map((subject) => (
                  <div key={subject.subject} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{subject.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {subject.periods_attended} / {subject.periods_held} periods
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{subject.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <Button onClick={() => navigate("/attendance/subjects")} className="w-full">
            <BookOpen className="mr-2 h-4 w-4" />
            Manage Subjects
          </Button>
          <Button onClick={() => navigate("/attendance/history")} variant="outline" className="w-full">
            <Calendar className="mr-2 h-4 w-4" />
            View History
          </Button>
          <Button onClick={() => navigate("/attendance/peers")} variant="outline" className="w-full">
            <Users className="mr-2 h-4 w-4" />
            View Peers
          </Button>
          <Button onClick={() => navigate("/attendance/import")} variant="outline" className="w-full">
            Import Data
          </Button>
          <Button onClick={() => navigate("/attendance/export")} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Quick Actions FAB */}
      <QuickActionsFAB rollNumber={rollNumber} />

      {/* AI Chatbot */}
      <AttendanceAIChatbot userId={rollNumber} />
    </motion.div>
  );
}

