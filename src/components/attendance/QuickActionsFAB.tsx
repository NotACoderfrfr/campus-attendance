import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { CheckCircle, XCircle, History, RefreshCw, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

interface QuickActionsFABProps {
  rollNumber: string;
}

export function QuickActionsFAB({ rollNumber }: QuickActionsFABProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showPresentDialog, setShowPresentDialog] = useState(false);
  const [showAbsentDialog, setShowAbsentDialog] = useState(false);
  const [showRefreshDialog, setShowRefreshDialog] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);

  const markTodayAttendance = useMutation(api.quickActions.markTodayAttendance);

  useEffect(() => {
    const timer = setTimeout(() => setIsPulsing(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleMarkPresent = async () => {
    try {
      const result = await markTodayAttendance({
        roll_number: rollNumber,
        attendance_type: "present",
      });
      
      toast.success(`✅ Marked ${result.subjectsMarked} subjects present for ${result.day}`, {
        description: `Subjects: ${result.subjects.join(", ")}`,
      });
      setShowPresentDialog(false);
      setIsOpen(false);
    } catch (error: any) {
      if (error.message === "No classes today") {
        toast.info("No classes on Sunday! Enjoy your rest day 🎉");
      } else {
        toast.error("Failed to mark attendance", {
          description: error.message,
        });
      }
      setShowPresentDialog(false);
    }
  };

  const handleMarkAbsent = async () => {
    try {
      const result = await markTodayAttendance({
        roll_number: rollNumber,
        attendance_type: "absent",
      });
      
      toast.warning(`⚠️ Marked ${result.subjectsMarked} subjects absent for ${result.day}`, {
        description: `Subjects: ${result.subjects.join(", ")}`,
      });
      setShowAbsentDialog(false);
      setIsOpen(false);
    } catch (error: any) {
      if (error.message === "No classes today") {
        toast.info("No classes on Sunday! Enjoy your rest day 🎉");
      } else {
        toast.error("Failed to mark attendance", {
          description: error.message,
        });
      }
      setShowAbsentDialog(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
    toast.success("🔄 Data refreshed");
    setShowRefreshDialog(false);
    setIsOpen(false);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-2xl hover:shadow-3xl transition-all z-50 md:h-14 md:w-14 max-md:h-12 max-md:w-12 ${
              isPulsing ? "animate-pulse" : ""
            }`}
            size="icon"
          >
            <Zap className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2 mb-2" align="center" side="top">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 hover:bg-accent transition-colors"
              onClick={() => {
                setShowPresentDialog(true);
                setIsOpen(false);
              }}
            >
              <CheckCircle className="h-4 w-4 text-green-600" />
              Mark Today Present
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 hover:bg-accent transition-colors"
              onClick={() => {
                setShowAbsentDialog(true);
                setIsOpen(false);
              }}
            >
              <XCircle className="h-4 w-4 text-red-600" />
              Mark Today Absent
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 hover:bg-accent transition-colors"
              onClick={() => {
                navigate("/attendance/history/undo");
                setIsOpen(false);
              }}
            >
              <History className="h-4 w-4 text-blue-600" />
              View Undo History
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 hover:bg-accent transition-colors"
              onClick={() => {
                setShowRefreshDialog(true);
                setIsOpen(false);
              }}
            >
              <RefreshCw className="h-4 w-4 text-purple-600" />
              Refresh All Data
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Mark Present Dialog */}
      <Dialog open={showPresentDialog} onOpenChange={setShowPresentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark All Subjects Present?</DialogTitle>
            <DialogDescription>
              This will mark all of today's subjects as present based on your batch schedule.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPresentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkPresent}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark Absent Dialog */}
      <Dialog open={showAbsentDialog} onOpenChange={setShowAbsentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark All Subjects Absent?</DialogTitle>
            <DialogDescription>
              This will mark all of today's subjects as absent. This action can be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAbsentDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleMarkAbsent}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refresh Dialog */}
      <Dialog open={showRefreshDialog} onOpenChange={setShowRefreshDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refresh All Data?</DialogTitle>
            <DialogDescription>
              This will reload all attendance data from the server.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefreshDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRefresh}>
              Refresh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}