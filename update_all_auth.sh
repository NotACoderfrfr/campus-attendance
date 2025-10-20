#!/bin/bash

# Update all attendance pages to use authService
for file in src/pages/attendance/*.tsx; do
  if [ -f "$file" ] && [ "$file" != "src/pages/attendance/Login.tsx" ] && [ "$file" != "src/pages/attendance/Auth.tsx" ]; then
    # Replace localStorage.getItem("studentRollNumber") with authService.getRollNumber()
    sed -i 's/localStorage\.getItem("studentRollNumber")/authService.getRollNumber()/g' "$file"
    
    # Replace localStorage.getItem("studentName") with authService.getName()
    sed -i 's/localStorage\.getItem("studentName")/authService.getName()/g' "$file"
    
    # Replace navigate("/attendance/auth") with navigate("/attendance/login")
    sed -i 's|navigate("/attendance/auth")|navigate("/attendance/login")|g' "$file"
    
    # Add import if not exists
    if ! grep -q "import { authService }" "$file"; then
      sed -i '1i import { authService } from "@/utils/auth";' "$file"
    fi
  fi
done

echo "✅ Updated all attendance pages to use authService"
