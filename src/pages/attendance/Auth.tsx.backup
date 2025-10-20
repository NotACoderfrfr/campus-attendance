import { authService } from "@/utils/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AttendanceAuth() {
  const navigate = useNavigate();
  const registerMutation = useMutation(api.students.register);
  const loginQuery = useMutation(api.students.login);
  const updatePhoneMutation = useMutation(api.students.updatePhoneNumber);
  
  const [isLoading, setIsLoading] = useState(false);
  const [registerData, setRegisterData] = useState({ name: "", roll_number: "" });
  const [loginRollNumber, setLoginRollNumber] = useState("");
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentRollNumber, setCurrentRollNumber] = useState("");

  const handlePhoneSubmit = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter a valid phone number");
      return;
    }

    // Validate phone number format (basic check)
    if (!/^\+?[1-9]\d{1,14}$/.test(phoneNumber.replace(/[\s-]/g, ""))) {
      toast.error("Please enter a valid phone number with country code (e.g., +911234567890)");
      return;
    }

    try {
      await updatePhoneMutation({
        roll_number: currentRollNumber,
        phone_number: phoneNumber,
      });
      toast.success("Phone number saved! You'll receive SMS reminders.");
      setShowPhoneDialog(false);
      navigate("/attendance/dashboard");
    } catch (error) {
      toast.error("Failed to save phone number");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const student = await registerMutation(registerData);
      if (!student) {
        throw new Error("Registration failed");
      }
      localStorage.setItem("studentName", student.name);
      localStorage.setItem("studentRollNumber", student.roll_number);
      setCurrentRollNumber(student.roll_number);
      toast.success("Registration successful!");
      setIsLoading(false);
      setShowPhoneDialog(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginRollNumber.trim()) {
      toast.error("Please enter your roll number");
      return;
    }
    setIsLoading(true);
    try {
      const student = await loginQuery({ roll_number: loginRollNumber.trim() });
      if (!student) {
        throw new Error("Student not found. Please register first.");
      }
      localStorage.setItem("studentName", student.name);
      localStorage.setItem("studentRollNumber", student.roll_number);
      setCurrentRollNumber(student.roll_number);
      toast.success("Login successful!");
      setIsLoading(false);
      
      // Show phone dialog if phone number not set
      if (!student.phone_number) {
        setShowPhoneDialog(true);
      } else {
        navigate("/attendance/dashboard");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      toast.error(errorMessage);
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Student Attendance</CardTitle>
          <CardDescription>Register or login to track your attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-roll">Roll Number</Label>
                  <Input
                    id="login-roll"
                    placeholder="Enter your roll number"
                    value={loginRollNumber}
                    onChange={(e) => setLoginRollNumber(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Name</Label>
                  <Input
                    id="register-name"
                    placeholder="Enter your name"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-roll">Roll Number</Label>
                  <Input
                    id="register-roll"
                    placeholder="Enter your roll number"
                    value={registerData.roll_number}
                    onChange={(e) => setRegisterData({ ...registerData, roll_number: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Register
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Phone Number Collection Dialog */}
      <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable SMS Reminders</DialogTitle>
            <DialogDescription>
              Get SMS reminders to update your attendance at scheduled times. Enter your phone number with country code (e.g., +911234567890).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+911234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Include country code (e.g., +91 for India)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowPhoneDialog(false);
              navigate("/attendance/dashboard");
            }}>
              Skip for now
            </Button>
            <Button onClick={handlePhoneSubmit}>
              Save & Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}