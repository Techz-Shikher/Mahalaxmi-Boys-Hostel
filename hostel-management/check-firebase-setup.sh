#!/bin/bash
# Firebase Configuration Checker
# This script helps diagnose Firebase setup issues

echo "🔍 Hostel Management System - Firebase Setup Checker"
echo "=================================================="
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file found"
else
    echo "❌ .env.local file NOT found"
    echo "   Create .env.local with Firebase credentials"
    echo ""
fi

# Check if environment variables are set
echo "Checking environment variables..."
echo ""

vars=(
    "NEXT_PUBLIC_FIREBASE_API_KEY"
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
    "NEXT_PUBLIC_FIREBASE_APP_ID"
)

missing_vars=0

for var in "${vars[@]}"; do
    value=$(grep "^$var=" .env.local 2>/dev/null | cut -d'=' -f2)
    if [ -z "$value" ] || [ "$value" = "your_*_here" ] || [[ "$value" == *"your_"* ]]; then
        echo "❌ $var - Not configured (placeholder value)"
        missing_vars=$((missing_vars + 1))
    else
        # Show first 10 chars then ...
        truncated="${value:0:10}..."
        echo "✅ $var - Configured"
    fi
done

echo ""
echo "=================================================="

if [ $missing_vars -eq 0 ]; then
    echo "✅ All environment variables configured!"
    echo ""
    echo "Next steps:"
    echo "1. Ensure Firestore database exists in Firebase Console"
    echo "2. Update Firestore Security Rules"
    echo "3. Run: npm install && npm run dev"
    echo "4. Check browser console for Firebase initialization message"
else
    echo "❌ Missing $missing_vars environment variable(s)"
    echo ""
    echo "To fix:"
    echo "1. Get Firebase config from Firebase Console > Project Settings"
    echo "2. Update .env.local with your credentials"
    echo "3. Restart development server"
fi

echo ""
