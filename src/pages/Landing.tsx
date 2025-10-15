import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, Users, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    >
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center max-w-4xl mx-auto space-y-8"
        >
          <div className="flex justify-center mb-8">
            <img
              src="./logo.svg"
              alt="Attendance System"
              width={80}
              height={80}
              className="rounded-lg"
            />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Student Attendance Tracker
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your attendance, manage subjects, and stay on top of your academic progress with our intuitive attendance management system.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/attendance/auth")}
              className="text-lg px-8 py-6"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/attendance/auth")}
              className="text-lg px-8 py-6"
            >
              Login
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 max-w-6xl w-full"
        >
          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <BookOpen className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Subject Management</CardTitle>
              <CardDescription>
                Track attendance for multiple subjects with ease
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <Calendar className="h-10 w-10 text-primary mb-2" />
              <CardTitle>History Tracking</CardTitle>
              <CardDescription>
                View detailed attendance records by date
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Peer Comparison</CardTitle>
              <CardDescription>
                See how your attendance compares with classmates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Real-time Updates</CardTitle>
              <CardDescription>
                Instant updates and accurate percentage calculations
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}