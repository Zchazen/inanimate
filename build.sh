#!/bin/bash
# Build script for Vercel deployment
# This ensures environment variables are available during Expo web build

echo "Building with environment variables:"
echo "EXPO_PUBLIC_SUPABASE_URL: ${EXPO_PUBLIC_SUPABASE_URL:0:30}..."
echo "EXPO_PUBLIC_API_URL: $EXPO_PUBLIC_API_URL"

npx expo export -p web
