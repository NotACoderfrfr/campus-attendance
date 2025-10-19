import { Button } from "@/components/ui/button";
import { WeeklyReport } from "@/components/attendance/WeeklyReport";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function WeeklyProgress() {
  const navigate = useNavigate();
  const rollNumber = localStorage.getItem("studentRollNumber");

  useEffect(() => {
    if (!rollNumber) {
      navigate("/attendance/auth");
    }
  }, [rollNumber, navigate]);

  if (!rollNumber) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 pb-24"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/attendance/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <WeeklyReport rollNumber={rollNumber} />
      </div>
    </motion.div>
  );
}
