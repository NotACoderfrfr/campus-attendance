import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Coffee, ArrowLeft, Skull, PartyPopper } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function BunkCalculatorPage() {
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

  // Weekly schedule: Mon=6, Tue=6, Wed=5, Thu=6, Fri=4, Sat=4
  const weeklySchedule = [0, 6, 6, 5, 6, 4, 4];
  
  const calculateBunkable = () => {
    if (overallPercentage < 75) {
      // Offensive puns for low attendance
      const offensivePuns = [
        "Bro, you're already bunking life. Why are you even here? 💀",
        "Bunk calculator? More like 'How to fail 101' calculator. Get to class! 😤",
        "Your attendance is lower than my expectations for you. And trust me, they're in the basement. 🏚️",
        "Bunking with this attendance? That's like asking for extra homework. Bold move, cotton. 🤡",
        "You're not bunking classes, you're speedrunning academic probation. Congrats! 🏆",
        "At this rate, your degree will come with a 'Did Not Attend' certificate. 📜",
        "Bunk calculator says: ERROR 404 - Attendance not found. Try attending first? 🤷",
        "You're the reason professors take attendance. Thanks for ruining it for everyone. 😒",
        "Your attendance is so low, even your shadow stopped showing up. 👻",
        "Bunking more classes? Sure, let's add 'professional class skipper' to your resume. 📝",
        "Your attendance percentage is lower than the chances of you passing. Do the math. 🧮",
        "Imagine checking a bunk calculator when you're already failing. The audacity! 😂",
        "You've bunked so much, the college thinks you're a myth. Bigfoot has better attendance. 🦶",
        "Your parents paid tuition for you to NOT attend? Genius business model! 💸",
        "Attendance below 75%? The only thing you're majoring in is disappointment. 🎓",
        "You're not a student, you're a tourist who occasionally visits campus. 🗺️",
        "Even online classes have better attendance than you. And they're ONLINE. 💻",
        "Your roll number should be changed to 'Absent'. It's more accurate. 📋",
        "Bunking calculator? Bro, you need a 'How to Show Up' calculator first. ⏰",
        "Your attendance is so bad, it's considered a cryptid sighting when you show up. 👽",
        "The only thing consistent about you is your inconsistency. Well done! 👏",
        "You've mastered the art of not being there. Too bad that's not a degree. 🎨",
        "Your attendance record looks like my bank account: depressingly low. 💰",
        "Checking bunk calculator with 60% attendance? That's like checking diet plans at McDonald's. 🍔",
        "You're the 'Where's Waldo' of your class, except nobody's looking for you. 🔍",
        "Your seat in class has more dust than a museum artifact. 🏛️",
        "Attendance this low should come with a warning label: 'Career at Risk'. ⚠️",
        "You've bunked so much, your classmates forgot your name. They call you 'That Ghost'. 👤",
        "The only thing you're attending regularly is the unemployment line. Get to class! 🚶",
        "Your attendance is like my motivation: non-existent and disappointing. 😴",
        "Bunk calculator? You need a 'Life Choices' calculator, my friend. 🤔",
        "You're not bunking classes, you're bunking your entire future. Smooth. 🛤️",
        "Your attendance percentage is lower than your chances of getting hired. Yikes. 💼",
        "Even the janitor has better attendance than you. And he's part-time! 🧹",
        "You've attended so few classes, your ID photo is considered a throwback. 📸",
        "Checking this calculator is like checking your horoscope: pointless and won't change reality. ⭐",
        "Your attendance is so low, it's basically a limbo contest. How low can you go? 🎪",
        "The only thing you're consistent at is being consistently absent. Bravo! 👎",
        "You're the reason 'attendance mandatory' exists. Thanks for nothing. 📢",
        "Your attendance record is a horror story professors tell to scare freshmen. 😱",
        "Bunking with this attendance? That's not confidence, that's delusion. 🤪",
        "You've missed so many classes, you're basically homeschooled at this point. 🏠",
        "Your attendance is lower than the temperature in Antarctica. And that's saying something. 🥶",
        "The only thing you're graduating with is regret. Congrats on that! 🎉",
        "You're not a student, you're a legend. A cautionary tale, but still a legend. 📖",
        "Your attendance is so bad, it's actually impressive. In the worst way possible. 🏅",
        "Checking bunk calculator? Bold of you to assume you have classes left to bunk. ⏳",
        "You've bunked so much, your degree should say 'Participated (Barely)'. 🎓",
        "Your attendance percentage is lower than my faith in humanity. And that's rock bottom. 🪨",
        "The only thing you're acing is the art of not showing up. Not a marketable skill, FYI. 🎯"
      ];
      
      const randomPun = offensivePuns[Math.floor(Math.random() * offensivePuns.length)];
      
      return { 
        canBunk: 0, 
        message: randomPun,
        isOffensive: true
      };
    }

    // Calculate how many periods can be missed while staying above 75%
    const maxPeriodsCanMiss = Math.floor((totalAttended / 0.75) - totalHeld);

    if (maxPeriodsCanMiss <= 0) {
      return { 
        canBunk: 0, 
        message: "You're walking on thin ice, my friend. One wrong move and you're below 75%! ⚠️",
        isOffensive: false
      };
    }

    // Calculate how many days this translates to
    const today = new Date();
    let currentDay = today.getDay();
    let periodsAccumulated = 0;
    let daysCount = 0;

    while (periodsAccumulated < maxPeriodsCanMiss && daysCount < 365) {
      daysCount++;
      currentDay = (currentDay + 1) % 7;
      periodsAccumulated += weeklySchedule[currentDay];
    }

    // Adjust if we went over
    if (periodsAccumulated > maxPeriodsCanMiss) {
      daysCount--;
    }

    return {
      canBunk: maxPeriodsCanMiss,
      days: daysCount,
      message: `You can skip up to ${maxPeriodsCanMiss} periods (approximately ${daysCount} days) and still maintain 75% attendance!`,
      isOffensive: false
    };
  };

  const result = calculateBunkable();

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
            <h1 className="text-3xl font-bold tracking-tight">Bunk Calculator</h1>
            <p className="text-muted-foreground">See how many classes you can skip (or can't) 😏</p>
          </div>
        </div>

        {/* Current Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Your Current Stats</CardTitle>
            <CardDescription>Let's see where you stand, {studentName}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-primary">{overallPercentage}%</p>
                <p className="text-xs text-muted-foreground mt-1">Overall Attendance</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-primary">{totalAttended}</p>
                <p className="text-xs text-muted-foreground mt-1">Periods Attended</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-primary">{totalHeld}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Periods</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bunk Calculator Result */}
        <Card className={
          result.isOffensive 
            ? "border-red-500 dark:border-red-800 bg-red-50 dark:bg-red-950" 
            : overallPercentage >= 75 
              ? "border-green-200 dark:border-green-800" 
              : "border-orange-200 dark:border-orange-800"
        }>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.isOffensive ? (
                <Skull className="h-6 w-6 text-red-600" />
              ) : result.canBunk > 0 ? (
                <PartyPopper className="h-6 w-6 text-green-600" />
              ) : (
                <Coffee className="h-5 w-5" />
              )}
              {result.isOffensive ? "Reality Check Time" : "Bunk Analysis"}
            </CardTitle>
            <CardDescription>
              {result.isOffensive 
                ? "Buckle up, this might hurt..." 
                : "Based on the weekly schedule (Mon-Sat: 6,6,5,6,4,4 periods)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result.canBunk > 0 ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-green-900 dark:text-green-100 font-medium">
                      {result.message}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                      But remember: Just because you can, doesn't mean you should! 😉
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-primary">{result.canBunk}</p>
                    <p className="text-xs text-muted-foreground">Periods You Can Skip</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-primary">~{result.days}</p>
                    <p className="text-xs text-muted-foreground">Approximate Days</p>
                  </div>
                </div>
              </div>
            ) : result.isOffensive ? (
              <div className="flex items-start gap-3 p-6 bg-red-100 dark:bg-red-950 rounded-lg border-2 border-red-500 dark:border-red-800">
                <Skull className="h-8 w-8 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-lg text-red-900 dark:text-red-100 font-bold mb-3">
                    {result.message}
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                    Your attendance is <span className="font-bold">{overallPercentage}%</span>. That's below the 75% minimum.
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Pro tip: Instead of checking how many classes you can bunk, maybe try attending some? Just a thought. 🤔
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-orange-900 dark:text-orange-100 font-medium">
                    {result.message}
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-2">
                    Focus on attending classes to improve your attendance percentage.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Disclaimer:</strong> This calculator is for entertainment and planning purposes only. 
              Attendance requirements may vary by institution. Always prioritize your education! 📚
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
