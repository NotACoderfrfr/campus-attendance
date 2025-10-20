#!/bin/bash

# Read the entire Dashboard.tsx file
DASHBOARD_FILE="src/pages/attendance/Dashboard.tsx"

# Remove the duplicate/misplaced import line
sed -i '/^import { authService } from "@\/utils\/auth";$/d' "$DASHBOARD_FILE"

# Add the import at the very top (after the first line if it's a comment)
sed -i '1i import { authService } from "@/utils/auth";' "$DASHBOARD_FILE"

echo "✅ Fixed Dashboard.tsx import"
