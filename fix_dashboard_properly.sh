#!/bin/bash

FILE="src/pages/attendance/Dashboard.tsx"

# Create a temp file with proper imports
{
  echo 'import { authService } from "@/utils/auth";'
  grep -v '^import { authService }' "$FILE"
} > "$FILE.tmp"

# Replace the file
mv "$FILE.tmp" "$FILE"

# Now replace the localStorage calls
sed -i 's/localStorage\.getItem("studentRollNumber")/authService.getRollNumber()/g' "$FILE"
sed -i 's/localStorage\.getItem("studentName")/authService.getName()/g' "$FILE"
sed -i 's|navigate("/attendance/auth")|navigate("/attendance/login")|g' "$FILE"

echo "✅ Dashboard fixed properly"
