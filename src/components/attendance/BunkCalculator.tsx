import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Coffee } from "lucide-react";

interface BunkCalculatorProps {
  totalHeld: number;
  totalAttended: number;
  overallPercentage: number;
}

export function BunkCalculator({ totalHeld, totalAttended, overallPercentage }: BunkCalculatorProps) {
  // Weekly schedule: Mon=6, Tue=6, Wed=5, Thu=6, Fri=4, Sat=4
  const weeklySchedule = [0, 6, 6, 5, 6, 4, 4];
  
  const calculateBunkable = () => {
    if (overallPercentage < 75) {
      return { canBunk: 0, message: "No bunks for you at the moment! Your attendance is below 75%." };
    }

    // Calculate how many periods can be missed while staying above 75%
    // Formula: (totalAttended) / (totalHeld + x) >= 0.75
    // Solving: x <= (totalAttended / 0.75) - totalHeld
    const maxPeriodsCanMiss = Math.floor((totalAttended / 0.75) - totalHeld);

    if (maxPeriodsCanMiss <= 0) {
      return { canBunk: 0, message: "No bunks for you at the moment! You're right at the edge of 75%." };
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
    };
  };

  const result = calculateBunkable();

  return (
    <Card className={overallPercentage >= 75 ? "border-green-200 dark:border-green-800" : "border-orange-200 dark:border-orange-800"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coffee className="h-5 w-5" />
          Bunk Calculator
        </CardTitle>
        <CardDescription>
          See how many periods you can skip while staying above 75%
        </CardDescription>
      </CardHeader>
      <CardContent>
        {result.canBunk > 0 ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-green-900 dark:text-green-100 font-medium">
                  {result.message}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                  Based on the weekly schedule (Mon-Sat: 6,6,5,6,4,4 periods)
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">{result.canBunk}</p>
                <p className="text-xs text-muted-foreground">Periods</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">~{result.days}</p>
                <p className="text-xs text-muted-foreground">Days</p>
              </div>
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
  );
}
