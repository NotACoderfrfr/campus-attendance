import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function FixLabRecords() {
  const fixLabs = useMutation(api.fix_lab_records.fixLabRecords);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleFix = async () => {
    setLoading(true);
    try {
      const res = await fixLabs({});
      setResult(JSON.stringify(res));
    } catch (error) {
      setResult("Error: " + error);
    }
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Fix Lab Records</h1>
      <Button onClick={handleFix} disabled={loading}>
        {loading ? "Fixing..." : "Fix All Lab Records"}
      </Button>
      {result && <pre className="mt-4 p-4 bg-gray-100 rounded">{result}</pre>}
    </div>
  );
}
