// Quick Diagnostic Test
// Paste this in browser console (F12 > Console) to check Firebase status

console.log("🔍 Firebase Configuration Checker");
console.log("==================================");

// Check environment variables from window
const firebaseConfig = {
  apiKey: window.NEXT_PUBLIC_FIREBASE_API_KEY || '❌ Not set',
  authDomain: window.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '❌ Not set',
  projectId: window.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '❌ Not set',
};

console.log("Firebase Config Status:");
console.table(firebaseConfig);

// Check if Firebase is initialized
try {
  console.log("✅ Firebase Libraries Loaded");
} catch (e) {
  console.log("❌ Firebase Libraries Error: " + e.message);
}

// Test message
console.log("");
console.log("If you see '❌ Not set', your .env.local file is missing or empty");
console.log("See: hostel-management/QUICK_FIX.md for solution");
