#!/bin/sh
set -e

echo "Starting database sync..."
npx prisma db push --url "$DATABASE_URL" --accept-data-loss

echo "Starting application..."
npm start
