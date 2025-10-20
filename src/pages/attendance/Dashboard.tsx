import { authService } from "@/utils/auth";
import AttendanceAIChatbot from "@/components/AttendanceAIChatbot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { motion } from "framer-motion";
import { BookOpen, Calendar, Loader2, Users, TrendingUp, TrendingDown, Coffee, Award, Flame, Download } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { toast } from "sonner";
import { QuickActionsFAB } from "@/components/attendance/QuickActionsFAB";

export default function Dashboard() {
  const navigate = useNavigate();
  const rollNumber = authService.getRollNumber();
  const studentName = authService.getName();

  useEffect(() => {
    if (!rollNumber) {
      navigate("/attendance/login");
    }
  }, [rollNumber, navigate]);

  // Rest of your Dashboard code stays the same - paste the rest from the backup
