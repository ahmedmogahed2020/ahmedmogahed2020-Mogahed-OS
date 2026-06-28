#!/usr/bin/env bash
set -euo pipefail

FAILED=0
while IFS= read -r file; do
  echo "Checking $file"
  if ! node --check "$file" >/dev/null; then
    FAILED=1
  fi
done < <(find assets -type f -name '*.js' | sort)

if [ "$FAILED" -eq 0 ]; then
  echo "All JavaScript files passed node --check."
else
  echo "Some JavaScript files failed syntax check." >&2
  exit 1
fi
