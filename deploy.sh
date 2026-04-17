#!/bin/bash
set -e

echo "🚀 Deploying AMIChat..."

echo "📦 Installing dependencies..."
npm ci

echo "🗄️ Running database migrations..."
npm run db:migrate

echo "🌱 Seeding default models..."
npm run db:seed

echo "🔨 Building application..."
npm run build

echo "✅ Deploy complete. Starting server..."
npm start
