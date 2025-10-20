import { authService } from "@/utils/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function History() {
  const navigate = useNavigate();
  const rollNumber = authService.getRollNumber();
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    if (!rollNumber) {
      navigate("/attendance/login");
    }
  }, [rollNumber, navigate]);

  const attendanceHistory = useQuery(
    api.attendance.getAttendanceHistory,
    rollNumber ? { roll_number: rollNumber, date: selectedDate || undefined } : "skip"
  );

  if (!rollNumber) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/attendance/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Attendance History</CardTitle>
            <CardDescription className="text-sm sm:text-base">View your attendance records by date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="Filter by date"
              />
              {selectedDate && (
                <Button variant="outline" onClick={() => setSelectedDate("")}>
                  Clear Filter
                </Button>
              )}
            </div>

            {!attendanceHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : attendanceHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No attendance records found</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Held</TableHead>
                      <TableHead>Attended</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceHistory.map((record) => {
                      const percentage = record.periods_held > 0
                        ? Math.round((record.periods_attended / record.periods_held) * 100)
                        : 0;
                      return (
                        <TableRow key={record._id}>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>{record.subject}</TableCell>
                          <TableCell>{record.periods_held}</TableCell>
                          <TableCell>{record.periods_attended}</TableCell>
                          <TableCell>{percentage}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}