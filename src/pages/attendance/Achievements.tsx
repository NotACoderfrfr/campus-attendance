import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Award, TrendingUp, Target, Zap, Lock, ArrowLeft, Flame } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";

const ACHIEVEMENT_DEFINITIONS = [
  {
    type: "first_step",
    title: "First Step",
    description: "Mark attendance for the first time",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
  },
  {
    type: "week_warrior",
    title: "Week Warrior",
    description: "7 consecutive days with 75%+ attendance",
    icon: Flame,
    color: "from-orange-500 to-red-500",
  },
  {
    type: "month_master",
    title: "Month Master",
    description: "30 consecutive days with 75%+ attendance",
    icon: Award,
    color: "from-purple-500 to-pink-500",
  },
  {
    type: "comeback_king",
    title: "Comeback King",
    description: "Improve from below 70% to above 80%",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-500",
  },
  {
    type: "perfect_subject",
    title: "Perfect Subject",
    description: "Achieve 95%+ in any single subject",
    icon: Zap,
    color: "from-yellow-500 to-amber-500",
  },
  {
    type: "attendance_hero",
    title: "Attendance Hero",
    description: "Reach 90%+ overall attendance",
    icon: Award,
    color: "from-indigo-500 to-blue-500",
  },
];

export default function Achievements() {
  const navigate = useNavigate();
  const rollNumber = localStorage.getItem("studentRollNumber");
  const studentName = localStorage.getItem("studentName");

  useEffect(() => {
    if (!rollNumber) {
      navigate("/attendance/auth");
    }
  }, [rollNumber, navigate]);

  const achievements = useQuery(
    api.achievements.getAchievements,
    rollNumber ? { roll_number: rollNumber } : "skip"
  );

  const streak = useQuery(
    api.achievements.getStreak,
    rollNumber ? { roll_number: rollNumber } : "skip"
  );

  if (!rollNumber) return null;

  const unlockedTypes = new Set(achievements?.map(a => a.achievement_type) || []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => navigate("/attendance/dashboard")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Achievements & Streaks</h1>
            <p className="text-muted-foreground">Track your progress, {studentName}!</p>
          </div>
        </div>

        {/* Streak Card */}
        <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-600" />
              Current Streak
            </CardTitle>
            <CardDescription>Keep your attendance above 75% daily!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-6 bg-white/50 dark:bg-black/20 rounded-lg">
                <p className="text-5xl font-bold text-orange-600">{streak?.current_streak || 0}</p>
                <p className="text-sm text-muted-foreground mt-2">Current Streak 🔥</p>
              </div>
              <div className="p-6 bg-white/50 dark:bg-black/20 rounded-lg">
                <p className="text-5xl font-bold text-purple-600">{streak?.longest_streak || 0}</p>
                <p className="text-sm text-muted-foreground mt-2">Longest Streak 🏆</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ACHIEVEMENT_DEFINITIONS.map((achievement, index) => {
              const isUnlocked = unlockedTypes.has(achievement.type);
              const Icon = achievement.icon;
              const unlockedData = achievements?.find(a => a.achievement_type === achievement.type);

              return (
                <motion.div
                  key={achievement.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`${isUnlocked ? "" : "opacity-50 grayscale"} transition-all hover:scale-105`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${achievement.color} ${isUnlocked ? "" : "opacity-30"}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        {isUnlocked ? (
                          <Badge variant="default" className="bg-green-500">Unlocked</Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Locked
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="mt-4">{achievement.title}</CardTitle>
                      <CardDescription>{achievement.description}</CardDescription>
                    </CardHeader>
                    {isUnlocked && unlockedData && (
                      <CardContent>
                        <p className="text-xs text-muted-foreground">
                          Unlocked on {new Date(unlockedData.unlocked_date).toLocaleDateString("en-US", { 
                            month: "short", 
                            day: "numeric", 
                            year: "numeric" 
                          })}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Achievement Progress</CardTitle>
            <CardDescription>You've unlocked {unlockedTypes.size} out of {ACHIEVEMENT_DEFINITIONS.length} badges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-muted rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${(unlockedTypes.size / ACHIEVEMENT_DEFINITIONS.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
