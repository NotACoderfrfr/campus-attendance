import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { BookOpen, Calendar, Loader2, Users } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function Dashboard() {
  const navigate = useNavigate();
  const rollNumber = localStorage.getItem("studentRollNumber");
  const studentName = localStorage.getItem("studentName");

  useEffect(() => {
    if (!rollNumber) {
      navigate("/attendance/auth");
    }
  }, [rollNumber, navigate]);

  const attendanceSummary = useQuery(
    api.attendance.getAttendanceSummary,
    rollNumber ? { roll_number: rollNumber } : "skip"
  );

  if (!rollNumber) return null;

  const totalHeld = attendanceSummary?.reduce((sum, s) => sum + s.periods_held, 0) || 0;
  const totalAttended = attendanceSummary?.reduce((sum, s) => sum + s.periods_attended, 0) || 0;
  const overallPercentage = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {studentName}!</h1>
            <p className="text-muted-foreground">Roll Number: {rollNumber}</p>
          </div>
          <Button variant="outline" onClick={() => {
            localStorage.removeItem("studentName");
            localStorage.removeItem("studentRollNumber");
            navigate("/attendance/auth");
          }}>
            Logout
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
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

          <Card className="cursor-pointer hover:bg-accent" onClick={() => navigate("/attendance/peers")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classmates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">View</div>
              <p className="text-xs text-muted-foreground">See peer attendance</p>
            </CardContent>
          </Card>
        </div>

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

        <div className="grid gap-4 md:grid-cols-3">
          <Button onClick={() => navigate("/attendance/subjects")} className="w-full">
            <BookOpen className="mr-2 h-4 w-4" />
            Manage Subjects
          </Button>
          <Button onClick={() => navigate("/attendance/history")} variant="outline" className="w-full">
            <Calendar className="mr-2 h-4 w-4" />
            View History
          </Button>
          <Button onClick={() => navigate("/attendance/import")} variant="outline" className="w-full">
            Import Data
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
