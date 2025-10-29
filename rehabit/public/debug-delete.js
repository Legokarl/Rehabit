// Quick Delete Group Debugger
// Copy and paste this into your browser console (F12)

console.clear();
console.log("🔍 GROUP DELETE DEBUGGER");
console.log("=" .repeat(50));

// Check authentication
const checkAuth = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.error("❌ NOT LOGGED IN");
      console.log("Solution: Log in to the app first");
      return null;
    }
    
    const user = JSON.parse(userStr);
    console.log("✅ Logged in");
    console.log("   User ID:", user.uid);
    console.log("   Email:", user.email);
    return user.uid;
  } catch (e) {
    console.error("❌ Error reading user data:", e);
    return null;
  }
};

const userId = checkAuth();

if (!userId) {
  console.log("\n⚠️  Please log in and run this script again");
} else {
  console.log("\n" + "=".repeat(50));
  console.log("📋 YOUR USER ID (copy this):");
  console.log(userId);
  console.log("=".repeat(50));
  
  console.log("\n📍 NEXT STEPS:");
  console.log("1. Go to: https://console.firebase.google.com/");
  console.log("2. Select project: rehabit-5f390");
  console.log("3. Click: Firestore Database");
  console.log("4. Open: groups collection");
  console.log("5. Find the group you want to delete");
  console.log("6. Check the 'createdBy' field");
  console.log("7. Compare with your User ID above");
  
  console.log("\n🎯 RESULT:");
  console.log("✅ If they MATCH → You can delete (continue debugging)");
  console.log("❌ If they DON'T match → You CANNOT delete this group");
  console.log("   Use 'Delete for Me' or 'Leave Group' instead");
  
  console.log("\n🔧 IF THEY MATCH BUT DELETE FAILS:");
  console.log("1. Open browser console (keep F12 open)");
  console.log("2. Go to the group");
  console.log("3. Click ⋮ → Delete Group");
  console.log("4. Watch for error messages here");
  console.log("5. Copy the EXACT error and share it");
  
  console.log("\n💡 COMMON FIXES:");
  console.log("• Wait 2 minutes after deploying rules");
  console.log("• Log out and log in again");
  console.log("• Hard refresh: Ctrl + Shift + R");
  console.log("• Try incognito mode");
  console.log("• Clear browser cache");
}

console.log("\n" + "=".repeat(50));
console.log("END DEBUGGER");

