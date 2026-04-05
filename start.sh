#!/bin/sh
set -e

echo "Starting database sync..."
npx prisma db push --accept-data-loss

echo "Starting application..."
npm start
