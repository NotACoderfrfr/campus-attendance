import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Loader2, Database } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function ExportData() {
  const navigate = useNavigate();
  const rollNumber = localStorage.getItem("studentRollNumber");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!rollNumber) {
      navigate("/attendance/auth");
    }
  }, [rollNumber, navigate]);

  const exportAllData = useAction(api.dataExport.exportAllData);

  const handleExportMyData = async () => {
    if (!rollNumber) return;
    
    setIsExporting(true);
    try {
      const data = await exportAllData({ roll_number: rollNumber });
      
      // Create a blob and download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_backup_${rollNumber}_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Data exported successfully!", {
        description: `Downloaded ${data.metadata.totalAttendanceRecords} attendance records`,
      });
    } catch (error) {
      toast.error("Failed to export data", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAllData = async () => {
    setIsExporting(true);
    try {
      const data = await exportAllData({});
      
      // Create a blob and download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_backup_all_students_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("All data exported successfully!", {
        description: `Downloaded data for ${data.metadata.totalStudents} students`,
      });
    } catch (error) {
      toast.error("Failed to export data", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!rollNumber) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/attendance/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              Export Attendance Data
            </CardTitle>
            <CardDescription>
              Download a complete backup of your attendance records in JSON format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-2">Export My Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download all your personal attendance records, achievements, streaks, and action history.
                  </p>
                  <ul className="text-sm text-muted-foreground mb-4 space-y-1 list-disc list-inside">
                    <li>Your student profile (name, roll number, phone)</li>
                    <li>All attendance records for all subjects</li>
                    <li>Unlocked achievements and badges</li>
                    <li>Current and longest streaks</li>
                    <li>Complete action history for undo/redo</li>
                  </ul>
                  <Button 
                    onClick={handleExportMyData} 
                    disabled={isExporting}
                    className="w-full"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Export My Data
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 dark:border-purple-800">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-2">Export All Students Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download complete database backup including all students' data (admin use).
                  </p>
                  <ul className="text-sm text-muted-foreground mb-4 space-y-1 list-disc list-inside">
                    <li>All student profiles</li>
                    <li>All attendance records for all students</li>
                    <li>All achievements across all students</li>
                    <li>All streaks data</li>
                    <li>Complete action history for all students</li>
                  </ul>
                  <Button 
                    onClick={handleExportAllData} 
                    disabled={isExporting}
                    variant="outline"
                    className="w-full"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Export All Data
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                What's included in the JSON export?
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>✅ Complete student information (name, roll number, phone number)</li>
                <li>✅ All attendance records with dates, subjects, periods held/attended</li>
                <li>✅ Achievement unlocks with dates and types</li>
                <li>✅ Streak data (current and longest streaks)</li>
                <li>✅ Action history for undo/redo functionality</li>
                <li>✅ Metadata (export date, record counts)</li>
              </ul>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
                💡 This JSON file can be used to restore your data or migrate to another system.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
