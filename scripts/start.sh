#!/bin/sh
set -e

: "${DATABASE_PATH:=/data/openchat.db}"
export DATABASE_PATH

DB_DIR="$(dirname "$DATABASE_PATH")"
mkdir -p "$DB_DIR"

echo "Running migrations against $DATABASE_PATH ..."
node_modules/.bin/drizzle-kit migrate

echo "Seeding default models ..."
node_modules/.bin/tsx scripts/seed-models.ts || echo "Seed step failed (continuing)."

echo "Starting Next.js ..."
exec node_modules/.bin/next start -H 0.0.0.0
