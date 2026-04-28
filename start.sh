#!/bin/bash
set -e

# Load .env file if present
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Create uploads directory if missing
mkdir -p uploads

echo "Starting Ghumo Global server on port ${PORT:-3000}..."
node server/index.mjs
