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

export default function AttendanceAuth() {
  const navigate = useNavigate();
  const registerMutation = useMutation(api.students.register);
  const loginQuery = useMutation(api.students.login);
  
  const [isLoading, setIsLoading] = useState(false);
  const [registerData, setRegisterData] = useState({ name: "", roll_number: "" });
  const [loginRollNumber, setLoginRollNumber] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const student = await registerMutation(registerData);
      // Add null check to satisfy TS
      if (!student) {
        throw new Error("Registration failed");
      }
      localStorage.setItem("studentName", student.name);
      localStorage.setItem("studentRollNumber", student.roll_number);
      toast.success("Registration successful!");
      navigate("/attendance/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
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
      // Add null check to satisfy TS
      if (!student) {
        throw new Error("Student not found. Please register first.");
      }
      localStorage.setItem("studentName", student.name);
      localStorage.setItem("studentRollNumber", student.roll_number);
      toast.success("Login successful!");
      navigate("/attendance/dashboard");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      toast.error(errorMessage);
      console.error("Login error:", error);
    } finally {
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
    </motion.div>
  );
}