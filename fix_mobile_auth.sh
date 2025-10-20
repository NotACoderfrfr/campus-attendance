#!/bin/bash

# Fix Dashboard to handle mobile tab suspension
cat > src/pages/attendance/Dashboard.tsx.patch << 'DASH_PATCH'
--- a/src/pages/attendance/Dashboard.tsx
+++ b/src/pages/attendance/Dashboard.tsx
@@ -15,11 +15,23 @@ import { QuickActionsFAB } from "@/components/attendance/QuickActionsFAB";
 
 export default function Dashboard() {
   const navigate = useNavigate();
-  const rollNumber = authService.getRollNumber();
-  const studentName = authService.getName();
+  const [rollNumber, setRollNumber] = useState<string | null>(null);
+  const [studentName, setStudentName] = useState<string | null>(null);
+  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
 
+  // Mobile-friendly auth check with retry
   useEffect(() => {
-    if (!rollNumber) {
+    const checkAuth = () => {
+      const roll = authService.getRollNumber();
+      const name = authService.getName();
+      
+      setRollNumber(roll);
+      setStudentName(name);
+      setIsCheckingAuth(false);
+    };
+    
+    // Small delay for mobile localStorage to be ready
+    setTimeout(checkAuth, 100);
+    
+    if (!isCheckingAuth && !rollNumber) {
       navigate("/attendance/login");
     }
DASH_PATCH

# Actually, let's do a simpler fix - just add useState and retry logic
FILE="src/pages/attendance/Dashboard.tsx"

# Add useState import if not present
if ! grep -q "useState" "$FILE"; then
  sed -i 's/import { useEffect }/import { useEffect, useState }/' "$FILE"
fi

# Replace the direct assignment with useState
sed -i 's/const rollNumber = authService.getRollNumber();/const [rollNumber, setRollNumber] = useState<string | null>(authService.getRollNumber());/' "$FILE"
sed -i 's/const studentName = authService.getName();/const [studentName, setStudentName] = useState<string | null>(authService.getName());/' "$FILE"

# Add a re-check effect for mobile
cat > /tmp/mobile_auth_check.txt << 'MOBILE_CHECK'

  // Mobile: Re-check auth when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const roll = authService.getRollNumber();
        const name = authService.getName();
        if (roll && name) {
          setRollNumber(roll);
          setStudentName(name);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
MOBILE_CHECK

# Insert after the first useEffect
awk '/useEffect.*rollNumber.*navigate/{print; print "  }, [rollNumber, navigate]);\n"; while(getline && !/^  \}, \[rollNumber, navigate\];/); system("cat /tmp/mobile_auth_check.txt"); next}1' "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"

echo "✅ Added mobile-friendly auth persistence"
