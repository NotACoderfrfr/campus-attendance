import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Calendar, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface WeeklyReportProps {
  rollNumber: string;
}

export function WeeklyReport({ rollNumber }: WeeklyReportProps) {
  const weeklyStats = useQuery(
    api.weeklyStats.getWeeklyStats,
    { roll_number: rollNumber }
  );

  if (!weeklyStats) {
    return null;
  }

  const { weekRange, currentWeek, previousWeek, percentageChange, daysLeftInWeek, subjectBreakdown } = weeklyStats;

  // Determine motivational message
  const getMotivationalMessage = (percentage: number) => {
    if (percentage > 85) return { text: "Outstanding week! You're crushing it! 🔥", color: "text-green-700 dark:text-green-300" };
    if (percentage >= 75) return { text: "Solid week! Keep up the momentum! 💪", color: "text-blue-700 dark:text-blue-300" };
    if (percentage >= 65) return { text: "Close call! Push harder next week! 📈", color: "text-orange-700 dark:text-orange-300" };
    return { text: "Tough week. Let's bounce back stronger! 💥", color: "text-red-700 dark:text-red-300" };
  };

  const motivationalMessage = getMotivationalMessage(currentWeek.percentage);

  // Prepare chart data
  const chartData = subjectBreakdown.map((subject) => ({
    name: subject.subject.length > 15 ? subject.subject.substring(0, 15) + "..." : subject.subject,
    percentage: subject.percentage,
    fill: subject.percentage > 75 ? "#22c55e" : subject.percentage >= 65 ? "#f97316" : "#ef4444",
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-lg rounded-xl bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Calendar className="h-6 w-6" />
                Weekly Progress Report
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {weekRange.startDisplay} - {weekRange.endDisplay}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Days left this week</p>
              <p className="text-3xl font-bold text-primary">{daysLeftInWeek}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Weekly Percentage Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">This Week</p>
                <p className="text-5xl font-bold text-primary">{currentWeek.percentage}%</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {currentWeek.periods_attended} / {currentWeek.periods_held} periods
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Last Week</p>
                <p className="text-5xl font-bold text-muted-foreground">{previousWeek.percentage}%</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Change</p>
                <div className="flex items-center justify-center gap-2">
                  {percentageChange > 0 ? (
                    <>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                      <p className="text-5xl font-bold text-green-600">+{percentageChange}%</p>
                    </>
                  ) : percentageChange < 0 ? (
                    <>
                      <TrendingDown className="h-8 w-8 text-red-600" />
                      <p className="text-5xl font-bold text-red-600">{percentageChange}%</p>
                    </>
                  ) : (
                    <p className="text-5xl font-bold text-muted-foreground">0%</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Motivational Message */}
          <div className="p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur rounded-lg border-2 border-primary/20">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-primary" />
              <p className={`text-lg font-semibold ${motivationalMessage.color}`}>
                {motivationalMessage.text}
              </p>
            </div>
          </div>

          {/* Subject Performance Chart */}
          {subjectBreakdown.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Subject-wise Performance</h3>
              <div className="h-[300px] w-full bg-white/60 dark:bg-gray-900/60 backdrop-blur rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip />
                    <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="3 3" label="75% Target" />
                    <ReferenceLine y={65} stroke="#f97316" strokeDasharray="3 3" label="65%" />
                    <Bar dataKey="percentage" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Subject Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                {subjectBreakdown.map((subject) => (
                  <Card 
                    key={subject.subject}
                    className={`${
                      subject.percentage > 75 
                        ? "border-green-500 bg-green-50 dark:bg-green-950" 
                        : subject.percentage >= 65 
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-950" 
                          : "border-red-500 bg-red-50 dark:bg-red-950"
                    } border-2`}
                  >
                    <CardContent className="pt-4">
                      <p className="font-semibold text-sm truncate">{subject.subject}</p>
                      <p className="text-2xl font-bold mt-1">{subject.percentage}%</p>
                      <p className="text-xs text-muted-foreground">
                        {subject.periods_attended} / {subject.periods_held} periods
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
