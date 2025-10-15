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

  const parseHTMLTable = (htmlContent: string) => {
    // Create a temporary DOM element to parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const rows = doc.querySelectorAll("tr");
    
    const records: Array<{
      subject: string;
      date: string;
      periods_held: number;
      periods_attended: number;
    }> = [];

    // Skip header row, start from index 1
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].querySelectorAll("td, th");
      if (cells.length >= 4) {
        const subject = cells[0]?.textContent?.trim() || "";
        const date = cells[1]?.textContent?.trim() || "";
        const held = parseInt(cells[2]?.textContent?.trim() || "0");
        const attended = parseInt(cells[3]?.textContent?.trim() || "0");

        if (subject && date) {
          // Try to parse date in various formats
          let formattedDate = date;
          try {
            const parsedDate = new Date(date);
            if (!isNaN(parsedDate.getTime())) {
              formattedDate = parsedDate.toISOString().split("T")[0];
            }
          } catch (e) {
            // Keep original date format if parsing fails
          }

          records.push({
            subject,
            date: formattedDate,
            periods_held: held,
            periods_attended: attended,
          });
        }
      }
    }

    return records;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !rollNumber) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      let records;

      // Check if it's HTML content (college attendance format)
      if (text.trim().startsWith("<") || text.includes("<table") || text.includes("<tr")) {
        records = parseHTMLTable(text);
        toast.success(`Detected HTML format. Parsing ${records.length} records...`);
      } else {
        // Fallback to CSV parsing
        const lines = text.split("\n").slice(1); // Skip header
        records = lines
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
      }

      if (records.length === 0) {
        toast.error("No valid records found in the file");
        return;
      }

      await importExcelMutation({ roll_number: rollNumber, records });
      toast.success(`Imported ${records.length} records successfully`);
      
      // Reset file input
      e.target.value = "";
    } catch (error) {
      console.error("Import error:", error);
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
            <CardDescription>Upload an Excel/HTML file from college website or enter data manually</CardDescription>
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
                      Upload Excel/HTML file from college website
                    </div>
                    <div className="text-xs text-muted-foreground mb-4">
                      Supports: .xls, .xlsx, .html, .csv formats
                    </div>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".csv,.xls,.xlsx,.html"
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