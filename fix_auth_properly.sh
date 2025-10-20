#!/bin/bash

AUTH_FILE="src/pages/attendance/Auth.tsx"

# Backup
cp "$AUTH_FILE" "$AUTH_FILE.backup"

# Replace localStorage.setItem calls with authService.login (properly this time)
# We need to find where it sets both roll number and name, then replace with single authService.login call

# First, let's see what the file contains
echo "Current Auth.tsx localStorage usage:"
grep -n "localStorage" "$AUTH_FILE"

echo ""
echo "We need to replace the localStorage calls with authService.login()"
