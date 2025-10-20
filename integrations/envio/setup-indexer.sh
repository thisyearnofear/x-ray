#!/bin/bash

# Envio Indexer Setup Script for X-RAY Medical Diagnostics
# This script sets up and deploys the Envio indexer for tracking medical NFT events

set -e

echo "🔍 Setting up Envio Indexer for X-RAY Medical Diagnostics..."

# Check if Envio CLI is installed
if ! command -v envio &> /dev/null; then
    echo "❌ Envio CLI not found. Installing..."
    npm install -g envio
fi

# Navigate to integrations directory
cd "$(dirname "$0")"

echo "📦 Installing dependencies..."
npm install --save-dev envio

echo "🔧 Generating indexer code from config..."
envio codegen

echo "📝 Building indexer..."
npm run build

echo "✅ Envio indexer setup complete!"
echo ""
echo "To start the indexer locally:"
echo "  cd integrations/envio"
echo "  envio dev"
echo ""
echo "To deploy to Envio hosted service:"
echo "  envio deploy"
echo ""
echo "📊 GraphQL endpoint will be available at:"
echo "  http://localhost:8080/graphql (local)"
echo "  https://indexer.envio.dev/[your-deployment-id]/graphql (hosted)"