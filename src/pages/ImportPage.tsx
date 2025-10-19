import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import attendanceData from "../../attendance.json";

export default function ImportPage() {
  const [status, setStatus] = useState("Ready to import");
  const [loading, setLoading] = useState(false);
  const importMutation = useMutation(api.importData.clearAndImport);

  const handleImport = async () => {
    setLoading(true);
    setStatus("Importing data...");
    
    try {
      const result = await importMutation({
        students: attendanceData.students,
        records: attendanceData.attendanceRecords
      });
      
      setStatus(`✅ Success! Imported ${result.students} students and ${result.records} attendance records`);
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Import Real Attendance Data</h1>
      <p>This will replace all test data with your real attendance records.</p>
      
      <button 
        onClick={handleImport}
        disabled={loading}
        style={{
          padding: "15px 30px",
          fontSize: "18px",
          backgroundColor: loading ? "#ccc" : "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: loading ? "not-allowed" : "pointer",
          marginTop: "20px"
        }}
      >
        {loading ? "Importing..." : "Import Data Now"}
      </button>
      
      <p style={{ marginTop: "20px", fontSize: "16px" }}>{status}</p>
      
      <div style={{ marginTop: "40px", fontSize: "14px", color: "#666" }}>
        <p>Data to be imported:</p>
        <ul>
          <li>{attendanceData.students.length} students</li>
          <li>{attendanceData.attendanceRecords.length} attendance records</li>
        </ul>
      </div>
    </div>
  );
}
