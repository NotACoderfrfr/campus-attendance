import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, Undo2, Redo2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

export default function UndoHistory() {
  const navigate = useNavigate();
  const rollNumber = localStorage.getItem("studentRollNumber");
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!rollNumber) {
      navigate("/attendance/auth");
    }
  }, [rollNumber, navigate]);

  const actionHistory = useQuery(
    api.actionHistory.getActionHistory,
    rollNumber ? { roll_number: rollNumber, limit: 50 } : "skip"
  );

  const undoAction = useMutation(api.actionHistory.undoAction);
  const redoAction = useMutation(api.actionHistory.redoAction);

  if (!rollNumber) return null;

  const handleUndo = async (actionId: Id<"action_history">, actionType: string, subject: string, timestamp: number) => {
    try {
      await undoAction({ action_id: actionId });
      const date = new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      toast.success(`Undone: ${actionType.replace("_", " ")} for ${subject} on ${date}`);
    } catch (error: any) {
      toast.error("Failed to undo action", {
        description: error.message,
      });
    }
  };

  const handleRedo = async (actionId: Id<"action_history">, actionType: string, subject: string, timestamp: number) => {
    try {
      await redoAction({ action_id: actionId });
      const date = new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      toast.success(`Redone: ${actionType.replace("_", " ")} for ${subject} on ${date}`);
    } catch (error: any) {
      toast.error("Failed to redo action", {
        description: error.message,
      });
    }
  };

  // Filter actions based on selected filter
  const filteredActions = actionHistory?.filter((action) => {
    if (filter === "all") return true;
    
    const actionDate = new Date(action.timestamp);
    const now = new Date();
    
    if (filter === "today") {
      return actionDate.toDateString() === now.toDateString();
    }
    
    if (filter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return actionDate >= weekAgo;
    }
    
    if (filter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return actionDate >= monthAgo;
    }
    
    return true;
  }) || [];

  // Group actions by date
  const groupedActions = filteredActions.reduce((acc, action) => {
    const date = new Date(action.timestamp).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    
    if (!acc[date]) {
      acc[date] = [];
    }
    
    acc[date].push(action);
    return acc;
  }, {} as Record<string, typeof filteredActions>);

  const getActionBadgeColor = (actionType: string) => {
    switch (actionType) {
      case "mark_present":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
      case "mark_absent":
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
      case "import_data":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
      case "delete_subject":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300";
    }
  };

  const getDotColor = (actionType: string) => {
    switch (actionType) {
      case "mark_present":
        return "bg-green-500";
      case "mark_absent":
        return "bg-red-500";
      case "import_data":
        return "bg-blue-500";
      case "delete_subject":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => navigate("/attendance/dashboard")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Undo History</h1>
            <p className="text-muted-foreground">View and manage your attendance action history</p>
          </div>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!actionHistory ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredActions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No actions found for the selected filter.
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {Object.entries(groupedActions).map(([date, actions]) => (
              <AccordionItem key={date} value={date} className="border rounded-lg bg-white dark:bg-gray-950">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{date}</span>
                    <Badge variant="secondary">{actions.length} actions</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4 relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600" />
                    
                    {actions.map((action, index) => (
                      <div key={action._id} className="relative pl-10">
                        <div className={`absolute left-2.5 top-2 h-3 w-3 rounded-full ${getDotColor(action.action_type)}`} />
                        
                        <Card className={action.undone ? "opacity-50" : ""}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline" className={getActionBadgeColor(action.action_type)}>
                                    {action.action_type.replace("_", " ")}
                                  </Badge>
                                  <span className={`text-sm ${action.undone ? "line-through" : ""}`}>
                                    {action.subject}
                                  </span>
                                </div>
                                
                                <p className="text-xs text-muted-foreground">
                                  {new Date(action.timestamp).toLocaleString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </p>
                              </div>
                              
                              <div className="flex gap-2">
                                {!action.undone ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUndo(action._id, action.action_type, action.subject, action.timestamp)}
                                  >
                                    <Undo2 className="h-4 w-4 mr-1" />
                                    Undo
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => handleRedo(action._id, action.action_type, action.subject, action.timestamp)}
                                  >
                                    <Redo2 className="h-4 w-4 mr-1" />
                                    Redo
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </motion.div>
  );
}
