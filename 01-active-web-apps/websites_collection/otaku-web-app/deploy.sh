#!/bin/bash

echo "🚀 Starting Otaku Gildija Network XR Deployment..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Build the Next.js application
echo "🏗️ Building the Next.js application..."
npm run build

# 3. Optimize 3D Assets (Placeholder for future asset pipeline)
echo "✨ Optimizing 3D assets... (Ready for Draco/KTX2 compression pipeline)"

# 4. Prepare for Hostinger Deployment
echo "✅ Build complete. Ready for Hostinger."
echo ""
echo "To deploy to Hostinger VPS:"
echo "1. Compress the project or use Git pull on the server."
echo "2. Run 'npm install --production' on the server."
echo "3. Run 'npm run start' or use PM2: 'pm2 start npm --name \"otaku-xr\" -- run start'"
echo ""
echo "If using Hostinger Shared Hosting with Node.js support:"
echo "1. Upload the .next folder, package.json, public folder, and next.config.ts"
echo "2. Configure the Node.js App in hPanel to point to 'node_modules/next/dist/bin/next' with arguments 'start'"
