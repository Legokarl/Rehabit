# ⚡ Quick Deploy to Vercel - 5 Minutes

## 🎯 Super Fast Deployment Guide

### **Option 1: Deploy via Vercel Website (Easiest)**

#### **Step 1: Push to GitHub (2 minutes)**

```bash
git init
git add .
git commit -m "ReHabit - Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/rehabit.git
git push -u origin main
```

#### **Step 2: Deploy on Vercel (2 minutes)**

1. Go to: https://vercel.com/new
2. Sign in with GitHub
3. Import your `rehabit` repository
4. Add environment variables (copy from `.env.local`)
5. Click "Deploy"

#### **Step 3: Update Firebase (1 minute)**

1. Go to Firebase Console → Authentication → Settings
2. Add your Vercel domain to "Authorized domains"
3. Done! ✅

---

### **Option 2: One-Click Deploy Button**

Add this to your GitHub README for instant deployment:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/rehabit)

---

## 🔑 Environment Variables to Add

Copy these from your `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

---

## ✅ Deployment Checklist

- [ ] Code on GitHub
- [ ] Vercel account created
- [ ] Environment variables added
- [ ] Firebase domain authorized
- [ ] App is live!

---

## 🚀 Your App Will Be Live At:

`https://rehabit-[random].vercel.app`

**Total Time: ~5 minutes** ⚡

For detailed instructions, see `VERCEL_DEPLOYMENT.md`
