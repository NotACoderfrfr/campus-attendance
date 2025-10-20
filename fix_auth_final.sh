#!/bin/bash

AUTH_FILE="src/pages/attendance/Auth.tsx"

# Replace the two localStorage.setItem calls with single authService.login call
# Lines 62-63 (registration)
sed -i '62,63s/.*/      authService.login(student.roll_number, student.name);/' "$AUTH_FILE"

# Lines 86-87 (login) - but they shifted up by 1 after previous edit, so now 85-86
sed -i '85,86s/.*/      authService.login(student.roll_number, student.name);/' "$AUTH_FILE"

# Remove duplicate lines created by sed
sed -i '63d' "$AUTH_FILE"
sed -i '86d' "$AUTH_FILE"

echo "✅ Replaced localStorage with authService.login()"
cat "$AUTH_FILE" | grep -n "authService.login"
