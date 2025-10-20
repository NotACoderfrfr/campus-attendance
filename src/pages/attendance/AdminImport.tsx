import { authService } from "@/utils/auth";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import attendanceData from "../../../attendance.json";

export default function AdminImport() {
  const [status, setStatus] = useState("Ready");
  const [loading, setLoading] = useState(false);
  const bulkImport = useMutation(api.adminImport.bulkImport);

  const handleBulkImport = async () => {
    if (!confirm("This will DELETE all existing data and import fresh data from attendance.json. Are you sure?")) {
      return;
    }
    
    setLoading(true);
    setStatus("Importing all data...");
    
    try {
      const result = await bulkImport({ data: attendanceData });
      
      setStatus(`✅ SUCCESS! Imported:
        - ${result.studentsImported} students
        - ${result.recordsImported} attendance records
        - ${result.achievementsImported} achievements
        - ${result.streaksImported} streaks
        
        Refresh your dashboard to see the new data!
      `);
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "700px", margin: "0 auto", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>🔧 Admin Bulk Import</h1>
      <p style={{ color: "#666", marginBottom: "30px" }}>Import complete database from attendance.json file</p>
      
      <div style={{ background: "#f5f5f5", padding: "20px", borderRadius: "8px", marginBottom: "30px" }}>
        <h3>📊 Data Preview:</h3>
        <ul style={{ marginTop: "10px", lineHeight: "1.8" }}>
          <li><strong>{attendanceData.students?.length || 0}</strong> students</li>
          <li><strong>{attendanceData.attendanceRecords?.length || 0}</strong> attendance records</li>
          <li><strong>{attendanceData.achievements?.length || 0}</strong> achievements</li>
          <li><strong>{attendanceData.streaks?.length || 0}</strong> streaks</li>
        </ul>
      </div>
      
      <div style={{ background: "#fff3cd", padding: "15px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #ffc107" }}>
        <strong>⚠️ Warning:</strong> This will delete ALL existing data and replace it with data from attendance.json
      </div>
      
      <button 
        onClick={handleBulkImport}
        disabled={loading}
        style={{
          padding: "15px 30px",
          fontSize: "18px",
          backgroundColor: loading ? "#ccc" : "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "bold"
        }}
      >
        {loading ? "⏳ Importing..." : "🚀 Import All Data Now"}
      </button>
      
      <pre style={{ 
        marginTop: "30px", 
        padding: "20px", 
        background: "#f8f9fa", 
        borderRadius: "8px",
        whiteSpace: "pre-wrap",
        fontSize: "14px"
      }}>
        {status}
      </pre>
      
      <div style={{ marginTop: "30px", padding: "20px", background: "#e7f3ff", borderRadius: "8px" }}>
        <h4>After Import:</h4>
        <ol style={{ marginTop: "10px", lineHeight: "1.8" }}>
          <li>Go to <a href="/attendance/dashboard" style={{ color: "#0066cc" }}>/attendance/dashboard</a></li>
          <li>Refresh the page (Ctrl+R or F5)</li>
          <li>You should see all 14 students with their real attendance data!</li>
        </ol>
      </div>
    </div>
  );
}
