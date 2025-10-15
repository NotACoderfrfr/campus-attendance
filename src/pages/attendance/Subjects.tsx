import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Subjects() {
  const navigate = useNavigate();
  const rollNumber = localStorage.getItem("studentRollNumber");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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
  const decrementMutation = useMutation(api.attendance.decrementAttendance);
  const addSubjectMutation = useMutation(api.attendance.addSubjectManual);

  const handleIncrement = async (subject: string, field: "held" | "attended") => {
    if (!rollNumber) return;
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
    try {
      await decrementMutation({
        roll_number: rollNumber,
        subject,
        date: new Date().toISOString().split("T")[0],
        field,
      });
      toast.success(`${field === "held" ? "Held" : "Attended"} periods decremented`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update attendance");
    }
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

  if (!rollNumber) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/attendance/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
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
                          <h3 className="text-lg font-semibold">{subject.subject}</h3>
                          <div className="text-2xl font-bold">{subject.percentage}%</div>
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
