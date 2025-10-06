#!/bin/bash
# Build script for Vercel deployment
# This creates a .env file that Expo can read during build

echo "Creating .env file with Vercel environment variables..."

cat > .env << EOF
EXPO_PUBLIC_SUPABASE_URL=${EXPO_PUBLIC_SUPABASE_URL}
EXPO_PUBLIC_SUPABASE_ANON_KEY=${EXPO_PUBLIC_SUPABASE_ANON_KEY}
EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL}
EOF

echo "Environment variables set:"
echo "EXPO_PUBLIC_SUPABASE_URL: ${EXPO_PUBLIC_SUPABASE_URL:0:30}..."
echo "EXPO_PUBLIC_API_URL: $EXPO_PUBLIC_API_URL"

echo "Running Expo export..."
npx expo export -p web

echo "Build complete!"
