#!/bin/bash

AUTH_FILE="src/pages/attendance/Auth.tsx"

# Replace localStorage.setItem("studentName", ...) followed by localStorage.setItem("studentRollNumber", ...)
# with a single authService.login() call

# Use perl for better multi-line replacement
perl -i -pe '
  if (/localStorage\.setItem\("studentName", student\.name\);/) {
    $_ = "      authService.login(student.roll_number, student.name);\n";
    $next = <>;  # Read next line
    if ($next =~ /localStorage\.setItem\("studentRollNumber", student\.roll_number\);/) {
      # Skip the second line, already handled
    } else {
      $_ .= $next;  # Put it back if it wasnt the rollNumber line
    }
  }
' "$AUTH_FILE"

echo "✅ Fixed Auth.tsx properly"
