#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 20-22 is required. Install it first."
  exit 1
fi

cp -n .env.example .env || true
npm install

if [ "${INSTALL_PM2:-false}" = "true" ]; then
  npm install -g pm2
fi

echo "Setup complete. Configure .env and run: npm start"
