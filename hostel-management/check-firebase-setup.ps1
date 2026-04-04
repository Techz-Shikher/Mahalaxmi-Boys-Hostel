# Firebase Configuration Checker for Windows PowerShell
# Run: .\check-firebase-setup.ps1

Write-Host "🔍 Hostel Management System - Firebase Setup Checker" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local file found" -ForegroundColor Green
} else {
    Write-Host "❌ .env.local file NOT found" -ForegroundColor Red
    Write-Host "   Please create .env.local with Firebase credentials" -ForegroundColor Yellow
    Write-Host ""
}

# Check if environment variables are set
Write-Host "Checking environment variables..." -ForegroundColor Cyan
Write-Host ""

$vars = @(
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"
)

$missingVars = 0

foreach ($var in $vars) {
    $content = Get-Content ".env.local" -ErrorAction SilentlyContinue | Select-String "^$var="
    
    if ($null -eq $content) {
        Write-Host "❌ $var - Not configured" -ForegroundColor Red
        $missingVars++
    } elseif ($content -match "your_" -or $content -match "placeholder") {
        Write-Host "❌ $var - Placeholder value (not configured)" -ForegroundColor Red
        $missingVars++
    } else {
        Write-Host "✅ $var - Configured" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan

if ($missingVars -eq 0) {
    Write-Host "✅ All environment variables configured!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Ensure Firestore database exists in Firebase Console"
    Write-Host "2. Update Firestore Security Rules (copy from firestore.rules)"
    Write-Host "3. Run: npm install && npm run dev"
    Write-Host "4. Check browser console for Firebase initialization"
} else {
    Write-Host "❌ Missing or unconfigured variables" -ForegroundColor Red
    Write-Host ""
    Write-Host "To fix:" -ForegroundColor Yellow
    Write-Host "1. Get Firebase config from Firebase Console"
    Write-Host "2. Open .env.local and update with real credentials"
    Write-Host "3. Restart development server"
}

Write-Host ""
Write-Host "For more help, see FIREBASE_SETUP.md" -ForegroundColor Cyan
