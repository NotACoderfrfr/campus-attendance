import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Minus, Plus, Trash2, RefreshCw, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Subjects() {
  const navigate = useNavigate();
  const rollNumber = localStorage.getItem("studentRollNumber");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [undoHistory, setUndoHistory] = useState<Record<string, { held: number; attended: number }>>({});
  const [newSubject, setNewSubject] = useState({
    subject: "",
    date: new Date().toISOString().split("T")[0],
    periods_held: 0,
    periods_attended: 0,
  });

  useEffect(() => {
    if (!rollNumber) {
      navigate("/attendance/auth");
    }
  }, [rollNumber, navigate]);

  const attendanceSummary = useQuery(
    api.attendance.getAttendanceSummary,
    rollNumber ? { roll_number: rollNumber } : "skip"
  );

  const incrementMutation = useMutation(api.attendance.incrementAttendance);
  const decrementMutation = useMutation(api.attendance.decrementTotal);
  const addSubjectMutation = useMutation(api.attendance.addSubjectManual);
  const deleteSubjectMutation = useMutation(api.attendance.deleteSubject);
  const updateAttendanceMutation = useMutation(api.attendance.updateAttendance);

  const saveUndoState = (subject: string, held: number, attended: number) => {
    setUndoHistory(prev => ({
      ...prev,
      [subject]: { held, attended }
    }));
  };

  const handleIncrement = async (subject: string, field: "held" | "attended") => {
    if (!rollNumber) return;
    
    const currentSubject = attendanceSummary?.find(s => s.subject === subject);
    if (!currentSubject) return;
    
    saveUndoState(subject, currentSubject.periods_held, currentSubject.periods_attended);
    
    try {
      await incrementMutation({
        roll_number: rollNumber,
        subject,
        date: new Date().toISOString().split("T")[0],
        field,
      });
      toast.success(`${field === "held" ? "Held" : "Attended"} periods incremented`);
    } catch (error) {
      toast.error("Failed to update attendance");
    }
  };

  const handleDecrement = async (subject: string, field: "held" | "attended") => {
    if (!rollNumber) return;
    
    const currentSubject = attendanceSummary?.find(s => s.subject === subject);
    if (!currentSubject) return;
    
    saveUndoState(subject, currentSubject.periods_held, currentSubject.periods_attended);
    
    try {
      await decrementMutation({
        roll_number: rollNumber,
        subject,
        field,
      });
      toast.success(`${field === "held" ? "Held" : "Attended"} periods decremented`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update attendance");
    }
  };

  const handleUndo = async (subject: string) => {
    if (!rollNumber) return;
    
    const previousState = undoHistory[subject];
    if (!previousState) {
      toast.error("No previous state to undo");
      return;
    }

    try {
      await updateAttendanceMutation({
        roll_number: rollNumber,
        subject,
        date: new Date().toISOString().split("T")[0],
        periods_held: previousState.held,
        periods_attended: previousState.attended,
      });
      
      setUndoHistory(prev => {
        const newHistory = { ...prev };
        delete newHistory[subject];
        return newHistory;
      });
      
      toast.success("Changes undone successfully");
    } catch (error) {
      toast.error("Failed to undo changes");
    }
  };

  const handleDeleteSubject = async (subject: string) => {
    if (!rollNumber) return;
    if (!confirm(`Are you sure you want to delete all attendance records for "${subject}"?`)) {
      return;
    }
    try {
      await deleteSubjectMutation({
        roll_number: rollNumber,
        subject,
      });
      toast.success(`Subject "${subject}" deleted successfully`);
    } catch (error) {
      toast.error("Failed to delete subject");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Attendance data refreshed");
    }, 500);
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNumber) return;
    try {
      await addSubjectMutation({
        roll_number: rollNumber,
        ...newSubject,
      });
      toast.success("Subject added successfully");
      setIsAddDialogOpen(false);
      setNewSubject({
        subject: "",
        date: new Date().toISOString().split("T")[0],
        periods_held: 0,
        periods_attended: 0,
      });
    } catch (error) {
      toast.error("Failed to add subject");
    }
  };

  const formatLastUpdated = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    }) + " at " + date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!rollNumber) return null;

  const totalHeld = attendanceSummary?.reduce((sum, s) => sum + s.periods_held, 0) || 0;
  const totalAttended = attendanceSummary?.reduce((sum, s) => sum + s.periods_attended, 0) || 0;
  const overallPercentage = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 10000) / 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => navigate("/attendance/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Subject</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Subject</DialogTitle>
                  <DialogDescription>Add a new subject with initial attendance</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddSubject}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject Name</Label>
                      <Input
                        id="subject"
                        value={newSubject.subject}
                        onChange={(e) => setNewSubject({ ...newSubject, subject: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newSubject.date}
                        onChange={(e) => setNewSubject({ ...newSubject, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="held">Periods Held</Label>
                      <Input
                        id="held"
                        type="number"
                        min="0"
                        value={newSubject.periods_held}
                        onChange={(e) => setNewSubject({ ...newSubject, periods_held: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="attended">Periods Attended</Label>
                      <Input
                        id="attended"
                        type="number"
                        min="0"
                        value={newSubject.periods_attended}
                        onChange={(e) => setNewSubject({ ...newSubject, periods_attended: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="submit">Add Subject</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Overall Attendance</p>
                <p className="text-4xl font-bold mt-1">{overallPercentage}%</p>
                <p className="text-sm opacity-90 mt-1">
                  {totalAttended} / {totalHeld} periods
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Total Subjects</p>
                <p className="text-3xl font-bold">{attendanceSummary?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Subjects</CardTitle>
            <CardDescription>Update attendance for each subject</CardDescription>
          </CardHeader>
          <CardContent>
            {!attendanceSummary ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : attendanceSummary.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No subjects yet. Add one to get started!</p>
            ) : (
              <div className="space-y-4">
                {attendanceSummary.map((subject) => (
                  <Card key={subject.subject}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{subject.subject}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              Last updated: {formatLastUpdated(subject.lastUpdated)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-2xl font-bold">{subject.percentage}%</div>
                            {undoHistory[subject.subject] && (
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleUndo(subject.subject)}
                                title="Undo last change"
                              >
                                <Undo2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => handleDeleteSubject(subject.subject)}
                              title="Delete subject"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Periods Held</Label>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleDecrement(subject.subject, "held")}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <div className="flex-1 text-center font-semibold">{subject.periods_held}</div>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleIncrement(subject.subject, "held")}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Periods Attended</Label>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleDecrement(subject.subject, "attended")}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <div className="flex-1 text-center font-semibold">{subject.periods_attended}</div>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleIncrement(subject.subject, "attended")}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
