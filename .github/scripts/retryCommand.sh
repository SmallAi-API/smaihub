#!/usr/bin/env bash
# Retry installs whose lifecycle scripts download binaries from GitHub Releases.
set -euo pipefail

for attempt in 1 2 3; do
  if "$@"; then
    exit 0
  else
    status=$?
  fi

  if [ "$attempt" -eq 3 ]; then
    echo "::error::Command failed after $attempt attempts (exit $status)"
    exit "$status"
  fi

  delay=$((attempt * 15))
  echo "::warning::Command failed (attempt $attempt/3, exit $status); retrying in ${delay}s"
  sleep "$delay"
done
