#!/bin/bash

# Find the actual Auth component being used
if [ -f "src/pages/attendance/Auth.tsx" ]; then
  AUTH_FILE="src/pages/attendance/Auth.tsx"
else
  AUTH_FILE="src/pages/attendance/AttendanceAuth.tsx"
fi

echo "Patching: $AUTH_FILE"

# Add authService import at the top
sed -i '1i import { authService } from "@/utils/auth";' "$AUTH_FILE"

# Replace localStorage.setItem calls with authService.login
sed -i 's/localStorage\.setItem("studentRollNumber", roll_number);/authService.login(roll_number, roll_number);/g' "$AUTH_FILE"
sed -i 's/localStorage\.setItem("studentName", roll_number);/\/\/ name set by authService.login/g' "$AUTH_FILE"

echo "✅ Patched existing auth to use authService"
