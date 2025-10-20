export default function Debug() {
  const data = {
    studentRollNumber: localStorage.getItem("studentRollNumber"),
    studentName: localStorage.getItem("studentName"),
    isAuthenticated: localStorage.getItem("isAuthenticated"),
    allKeys: Object.keys(localStorage),
    allData: {...localStorage}
  };

  return (
    <div style={{padding: "20px", fontFamily: "monospace"}}>
      <h1>Debug Info</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
