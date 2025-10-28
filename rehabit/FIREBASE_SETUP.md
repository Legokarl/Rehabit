# 🔥 Firebase Setup Guide - Step by Step

## Overview
This guide will walk you through setting up Firebase for ReHabit in **5 minutes**.

---

## Step 1: Create Firebase Project (1 minute)

1. Go to **https://console.firebase.google.com/**
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: **`ReHabit`** (or any name you prefer)
4. Click **Continue**
5. **Disable Google Analytics** (optional, not needed for this project)
6. Click **Create project**
7. Wait for project creation (~30 seconds)
8. Click **Continue**

---

## Step 2: Enable Authentication (2 minutes)

### Enable Email/Password Authentication

1. In the left sidebar, click **"Authentication"**
2. Click **"Get started"**
3. Click on **"Email/Password"** in the Sign-in providers list
4. Toggle **"Email/Password"** to **Enabled**
5. Click **"Save"**

### Enable Google Authentication

1. Still in Authentication, click **"Sign-in method"** tab
2. Click on **"Google"** in the providers list
3. Toggle to **Enabled**
4. Enter a **Project support email** (your email)
5. Click **"Save"**

### Add Authorized Domain (if needed)

1. Click **"Settings"** tab in Authentication
2. Scroll to **"Authorized domains"**
3. Make sure **`localhost`** is listed (it should be by default)

---

## Step 3: Create Firestore Database (1 minute)

1. In the left sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
   - This allows read/write access for 30 days
   - Perfect for hackathon/demo purposes
4. Choose your **Cloud Firestore location** (closest to you)
   - Example: `us-central` or `europe-west`
5. Click **"Enable"**
6. Wait for database creation (~30 seconds)

---

## Step 4: Get Firebase Configuration (1 minute)

1. Click the **⚙️ gear icon** (Settings) in the left sidebar
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** `</>`
5. Enter app nickname: **`ReHabit Web`**
6. **Do NOT** check "Also set up Firebase Hosting"
7. Click **"Register app"**
8. You'll see a `firebaseConfig` object - **COPY IT**

It looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "rehabit-xxxxx.firebaseapp.com",
  projectId: "rehabit-xxxxx",
  storageBucket: "rehabit-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxxxxx"
};
```
const firebaseConfig = {
  apiKey: "AIzaSyCEJtBdsvpKXz62j5qhDmrPitP4mS9gQ-k",
  authDomain: "rehabit-5f390.firebaseapp.com",
  projectId: "rehabit-5f390",
  storageBucket: "rehabit-5f390.firebasestorage.app",
  messagingSenderId: "544638848439",
  appId: "1:544638848439:web:e53ba98aa605f4fe3cec32"
};

9. Click **"Continue to console"**

---

## Step 5: Configure Environment Variables (1 minute)

1. Open your project folder: `C:\Users\LENOVO\CascadeProjects\rehabit`
2. Create a new file named **`.env.local`** (note the dot at the start)
3. Copy the following template:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

4. Replace the values with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rehabit-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=rehabit-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rehabit-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxxxxx
```

5. **Save the file**

---

## Step 6: Test Your Setup

1. Open terminal in project folder
2. Run:
```bash
npm run dev
```

3. Open browser to **http://localhost:3000**
4. Click **"Get Started"**
5. Try signing up with email or Google
6. If successful, you'll see the dashboard! 🎉

---

## 🔒 Security Rules (Optional - For Production)

If you want to deploy to production, update Firestore security rules:

1. Go to **Firestore Database**
2. Click **"Rules"** tab
3. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read all user profiles
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only read/write their own habits
    match /habits/{habitId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
  }
}
```

4. Click **"Publish"**

---

## 🎯 Verification Checklist

Before running the app, verify:

- ✅ Firebase project created
- ✅ Email/Password authentication enabled
- ✅ Google authentication enabled
- ✅ Firestore database created (test mode)
- ✅ Web app registered
- ✅ `.env.local` file created
- ✅ All 6 environment variables set
- ✅ Values match your Firebase config

---

## 🐛 Troubleshooting

### Error: "Firebase not configured"
**Solution**: Check that `.env.local` exists and has all 6 variables

### Error: "Auth domain not authorized"
**Solution**: Add `localhost` to authorized domains in Firebase Authentication settings

### Error: "Permission denied" in Firestore
**Solution**: Make sure Firestore is in "test mode" or update security rules

### Error: "Invalid API key"
**Solution**: Double-check you copied the correct values from Firebase console

### Google Sign-In not working
**Solution**: 
1. Verify Google provider is enabled in Authentication
2. Check that you added a support email
3. Make sure `localhost` is in authorized domains

---

## 📊 Expected Firebase Structure

After using the app, your Firestore will have:

### Collections:
```
📁 users/
  📄 {userId}/
    - uid: string
    - email: string
    - displayName: string
    - xp: number
    - level: number
    - badges: array
    - streakDays: number
    - joinedAt: timestamp

📁 habits/
  📄 {habitId}/
    - userId: string
    - name: string
    - description: string
    - icon: string
    - streak: number
    - completedDates: array
    - createdAt: timestamp
```

---

## 🚀 You're All Set!

Firebase is now configured for ReHabit. Run the app and start building habits! 💪

**Next**: Run `npm run dev` and visit http://localhost:3000
