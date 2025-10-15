import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, FileUp, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function ImportData() {
  const navigate = useNavigate();
  const rollNumber = localStorage.getItem("studentRollNumber");
  const [isLoading, setIsLoading] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    subject: "",
    date: new Date().toISOString().split("T")[0],
    periods_held: 0,
    periods_attended: 0,
  });

  const importExcelMutation = useMutation(api.attendance.importExcel);
  const addSubjectMutation = useMutation(api.attendance.addSubjectManual);

  useEffect(() => {
    if (!rollNumber) {
      navigate("/attendance/auth");
    }
  }, [rollNumber, navigate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !rollNumber) return;

    setIsLoading(true);
    try {
      // Simple CSV parsing (expecting: subject,date,held,attended)
      const text = await file.text();
      const lines = text.split("\n").slice(1); // Skip header
      const records = lines
        .filter((line) => line.trim())
        .map((line) => {
          const [subject, date, held, attended] = line.split(",");
          return {
            subject: subject.trim(),
            date: date.trim(),
            periods_held: parseInt(held.trim()),
            periods_attended: parseInt(attended.trim()),
          };
        });

      await importExcelMutation({ roll_number: rollNumber, records });
      toast.success(`Imported ${records.length} records successfully`);
    } catch (error) {
      toast.error("Failed to import data. Please check file format.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNumber) return;
    setIsLoading(true);
    try {
      await addSubjectMutation({
        roll_number: rollNumber,
        ...manualEntry,
      });
      toast.success("Record added successfully");
      setManualEntry({
        subject: "",
        date: new Date().toISOString().split("T")[0],
        periods_held: 0,
        periods_attended: 0,
      });
    } catch (error) {
      toast.error("Failed to add record");
    } finally {
      setIsLoading(false);
    }
  };

  if (!rollNumber) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/attendance/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Import Attendance Data</CardTitle>
            <CardDescription>Upload a CSV file or enter data manually</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="file" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file">Upload File</TabsTrigger>
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <FileUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-sm text-muted-foreground mb-2">
                      Upload CSV file (subject, date, held, attended)
                    </div>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      disabled={isLoading}
                      className="hidden"
                    />
                    <Button variant="outline" disabled={isLoading} asChild>
                      <span>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          "Choose File"
                        )}
                      </span>
                    </Button>
                  </Label>
                </div>
              </TabsContent>

              <TabsContent value="manual">
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manual-subject">Subject</Label>
                    <Input
                      id="manual-subject"
                      value={manualEntry.subject}
                      onChange={(e) => setManualEntry({ ...manualEntry, subject: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual-date">Date</Label>
                    <Input
                      id="manual-date"
                      type="date"
                      value={manualEntry.date}
                      onChange={(e) => setManualEntry({ ...manualEntry, date: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="manual-held">Periods Held</Label>
                      <Input
                        id="manual-held"
                        type="number"
                        min="0"
                        value={manualEntry.periods_held}
                        onChange={(e) => setManualEntry({ ...manualEntry, periods_held: parseInt(e.target.value) || 0 })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manual-attended">Periods Attended</Label>
                      <Input
                        id="manual-attended"
                        type="number"
                        min="0"
                        value={manualEntry.periods_attended}
                        onChange={(e) => setManualEntry({ ...manualEntry, periods_attended: parseInt(e.target.value) || 0 })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Record"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
