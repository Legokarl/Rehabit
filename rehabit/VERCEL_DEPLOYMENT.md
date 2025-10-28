# 🚀 Deploy ReHabit to Vercel

Complete step-by-step guide to deploy your ReHabit app to Vercel.

---

## 📋 Prerequisites

✅ GitHub account  
✅ Vercel account (free)  
✅ Your ReHabit project  
✅ Firebase configuration ready  

---

## 🎯 Deployment Steps

### **Step 1: Create GitHub Repository**

1. **Go to GitHub**: https://github.com/new
2. **Create new repository**:
   - Repository name: `rehabit`
   - Description: "Gamified habit tracking app"
   - Visibility: Public or Private
   - **Don't** initialize with README (we already have files)
3. **Click "Create repository"**

---

### **Step 2: Push Your Code to GitHub**

Open a new terminal in your project folder and run these commands:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your code
git commit -m "Initial commit - ReHabit app with community chat"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/rehabit.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

---

### **Step 3: Sign Up for Vercel**

1. **Go to Vercel**: https://vercel.com/signup
2. **Sign up with GitHub** (recommended)
3. **Authorize Vercel** to access your GitHub account

---

### **Step 4: Import Project to Vercel**

1. **Click "Add New Project"** on Vercel dashboard
2. **Import Git Repository**
3. **Select your `rehabit` repository**
4. **Click "Import"**

---

### **Step 5: Configure Project Settings**

Vercel will auto-detect Next.js. Configure these settings:

#### **Framework Preset:**
- ✅ Next.js (auto-detected)

#### **Root Directory:**
- Leave as `./` (default)

#### **Build Command:**
- `npm run build` (default)

#### **Output Directory:**
- `.next` (default)

#### **Install Command:**
- `npm install` (default)

---

### **Step 6: Add Environment Variables** ⚠️ IMPORTANT

Click **"Environment Variables"** and add these from your `.env.local` file:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCEJtBdsvpKXz62j5qhDmrPitP4mS9gQ-k
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rehabit-5f390.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=rehabit-5f390
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rehabit-5f390.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=544638848439
NEXT_PUBLIC_FIREBASE_APP_ID=1:544638848439:web:e53ba98aa605f4fe3cec32
```

**How to add:**
1. Click "Environment Variables"
2. For each variable:
   - **Name**: `NEXT_PUBLIC_FIREBASE_API_KEY`
   - **Value**: `AIzaSyCEJtBdsvpKXz62j5qhDmrPitP4mS9gQ-k`
   - Click "Add"
3. Repeat for all 6 variables

---

### **Step 7: Deploy!**

1. **Click "Deploy"**
2. **Wait 2-3 minutes** for build to complete
3. **Your app will be live!** 🎉

You'll get a URL like: `https://rehabit-xyz123.vercel.app`

---

## 🔧 Post-Deployment: Update Firebase

### **Add Vercel Domain to Firebase**

Your app won't work until you authorize the Vercel domain in Firebase:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: rehabit-5f390
3. **Click "Authentication"** → **"Settings"** tab
4. **Scroll to "Authorized domains"**
5. **Click "Add domain"**
6. **Add your Vercel URL**: `rehabit-xyz123.vercel.app` (without https://)
7. **Click "Add"**

**⚠️ Without this step, authentication will fail with "unauthorized-domain" error!**

---

## 🎨 Custom Domain (Optional)

### **Add Your Own Domain:**

1. **In Vercel Dashboard**, go to your project
2. **Click "Settings"** → **"Domains"**
3. **Add your domain** (e.g., `rehabit.com`)
4. **Follow DNS configuration instructions**
5. **Add custom domain to Firebase** authorized domains too!

---

## 🔄 Automatic Deployments

Every time you push to GitHub, Vercel will automatically:
- ✅ Build your app
- ✅ Run tests
- ✅ Deploy to production
- ✅ Generate preview URL

### **To Update Your App:**

```bash
# Make changes to your code
git add .
git commit -m "Update: added new feature"
git push

# Vercel automatically deploys! 🚀
```

---

## 📊 Vercel Dashboard Features

### **What You Get:**

- **Analytics**: Page views, performance metrics
- **Logs**: Build and runtime logs
- **Deployments**: History of all deployments
- **Preview URLs**: Test before production
- **Environment Variables**: Manage secrets
- **Custom Domains**: Add your own domain

---

## 🐛 Troubleshooting

### **Build Failed?**

**Check these:**
1. All dependencies in `package.json`
2. No TypeScript errors locally
3. Environment variables added correctly
4. Check build logs in Vercel

**Common fixes:**
```bash
# Test build locally first
npm run build

# If it works locally, it should work on Vercel
```

---

### **Authentication Not Working?**

**Fix:**
1. Add Vercel domain to Firebase authorized domains
2. Check environment variables are set correctly
3. Verify Firebase config in Vercel dashboard

---

### **Chat Not Working?**

**Fix:**
1. Deploy Firestore security rules (see `COMMUNITY_CHAT_SETUP.md`)
2. Check Firestore is enabled in Firebase
3. Verify rules allow authenticated users

---

### **Images Not Loading?**

**Fix:**
1. Check `next.config.js` has correct image domains
2. Verify image URLs are accessible
3. Check Vercel logs for errors

---

## 🎯 Quick Deployment Checklist

Before deploying, verify:

- [ ] Code pushed to GitHub
- [ ] All environment variables ready
- [ ] Firebase project is active
- [ ] Firestore security rules deployed
- [ ] No build errors locally (`npm run build`)
- [ ] `.gitignore` includes `.env.local`
- [ ] `node_modules` not committed

---

## 📱 Test Your Deployed App

After deployment:

1. ✅ **Visit your Vercel URL**
2. ✅ **Test landing page loads**
3. ✅ **Try signing up/logging in**
4. ✅ **Create a habit**
5. ✅ **Complete a habit (earn XP)**
6. ✅ **Check leaderboard**
7. ✅ **Test community chat**
8. ✅ **Test on mobile device**

---

## 🚀 Alternative: Deploy via Vercel CLI

### **Install Vercel CLI:**

```bash
npm install -g vercel
```

### **Deploy:**

```bash
# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Deploy to production
vercel --prod
```

---

## 🎉 Success!

Your ReHabit app is now live on Vercel! 

### **Share Your App:**
- Production URL: `https://rehabit-xyz123.vercel.app`
- GitHub Repo: `https://github.com/YOUR_USERNAME/rehabit`

### **For Your Hackathon:**
- ✅ Live demo ready
- ✅ Professional hosting
- ✅ Fast global CDN
- ✅ Automatic HTTPS
- ✅ Perfect for presentations

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Vercel Support**: https://vercel.com/support

---

## 💡 Pro Tips

### **For Hackathon Demo:**

1. **Custom Domain**: Makes it more professional
2. **Analytics**: Show real usage stats
3. **Preview Deployments**: Test features before going live
4. **Environment Variables**: Keep secrets secure
5. **Monitoring**: Check performance metrics

### **Performance:**

- Vercel automatically optimizes images
- Global CDN for fast loading
- Automatic code splitting
- Edge functions for speed

### **Collaboration:**

- Add team members in Vercel
- Share preview URLs for feedback
- Automatic deployments from GitHub
- Branch previews for testing

---

**Your app is production-ready! 🎉**

Good luck with your hackathon! 🚀
