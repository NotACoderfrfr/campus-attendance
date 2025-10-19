import { useState } from "react";

export default function ImportData() {
  const [status] = useState("This page is deprecated. Use /attendance/admin-import instead");

  return (
    <div style={{ padding: "20px" }}>
      <h1>Import Attendance Data</h1>
      <p>{status}</p>
      <a href="/attendance/admin-import" style={{ color: "blue", textDecoration: "underline" }}>
        Go to Admin Import Page
      </a>
    </div>
  );
}

