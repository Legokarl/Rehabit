# 🎯 ReHabit - Gamified Habit Tracking Platform

**ReHabit** is a modern, gamified habit-tracking and community accountability platform designed to help users build and sustain habits through social motivation, friendly competition, and progress sharing.

![ReHabit](https://img.shields.io/badge/Next.js-14.0-black?style=for-the-badge&logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-10.7-orange?style=for-the-badge&logo=firebase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-blue?style=for-the-badge&logo=tailwindcss)

## ✨ Features

### 🔐 Authentication
- **Email/Password Authentication** - Secure sign-up and login
- **Google OAuth** - Quick sign-in with Google account
- Beautiful glass-morphism UI design

### 🎯 Habit Tracking
- **Create Custom Habits** - Add habits with custom icons and descriptions
- **Daily Check-ins** - Mark habits as complete each day
- **Streak Tracking** - Build momentum with daily streaks
- **Visual Progress** - See your habit completion history

### 🏆 Gamification
- **XP System** - Earn 10 XP for each habit completion
- **Level Progression** - Level up as you earn more XP
- **Badges** - Unlock achievements for consistency
- **Leaderboard** - Compete with other users

### 👥 Community (Coming Soon)
- **Community Feed** - Share progress and motivate others
- **Group Challenges** - Join team accountability challenges
- **Social Motivation** - Get inspired by others' journeys

### 🎨 Design
- **Glass UI** - Modern glassmorphism design
- **Smooth Animations** - Framer Motion powered transitions
- **Responsive** - Works perfectly on all devices
- **Soft Pastel Palette** - Calming and motivating colors

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Firebase account (for backend services)

### Installation

1. **Clone or navigate to the project**
```bash
cd C:\Users\LENOVO\CascadeProjects\rehabit
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable **Authentication** (Email/Password and Google providers)
   - Enable **Firestore Database**
   - Copy your Firebase config

4. **Configure environment variables**
   - Copy `.env.example` to `.env.local`
   - Add your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## 🗂️ Project Structure

```
rehabit/
├── app/
│   ├── page.tsx              # Landing page
│   ├── auth/
│   │   └── page.tsx          # Authentication page
│   ├── dashboard/
│   │   └── page.tsx          # Main dashboard
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── contexts/
│   └── AuthContext.tsx       # Authentication context
├── lib/
│   └── firebase.ts           # Firebase configuration
├── public/                   # Static assets
├── .env.example              # Environment variables template
├── package.json              # Dependencies
├── tailwind.config.ts        # Tailwind configuration
└── tsconfig.json             # TypeScript configuration
```

## 🎮 How to Use

### 1. Sign Up
- Visit the landing page
- Click "Get Started Free"
- Sign up with email or Google

### 2. Create Habits
- Click "Add Habit" on the dashboard
- Choose a name, description, and icon
- Click "Create Habit"

### 3. Track Progress
- Click on a habit card to mark it complete for today
- Watch your streak grow!
- Earn XP and level up

### 4. Compete
- Check the leaderboard to see top performers
- Earn badges for consistency
- Climb the ranks!

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Firebase
  - Authentication
  - Firestore Database
- **Date Handling**: date-fns

## 🎨 Design Philosophy

ReHabit focuses on creating an emotionally uplifting experience:
- **Glass UI** - Modern, clean aesthetic
- **Soft Pastels** - Calming purple, pink, and blue gradients
- **Smooth Animations** - Delightful micro-interactions
- **Friendly Icons** - Emoji-based habit icons
- **Motivating Copy** - Positive, encouraging language

## 📱 Features Breakdown

### Stats Dashboard
- Current Streak
- Active Habits Count
- Total XP
- Badges Earned

### Habit Cards
- Custom emoji icons
- Completion checkbox
- Streak counter
- Total completions

### Leaderboard
- Top 10 users
- XP rankings
- Level display
- Medal indicators (🥇🥈🥉)

## 🔥 Firebase Setup Details

### Firestore Collections

**users**
```typescript
{
  uid: string
  email: string
  displayName: string
  photoURL: string | null
  xp: number
  level: number
  badges: string[]
  streakDays: number
  joinedAt: Date
}
```

**habits**
```typescript
{
  id: string
  userId: string
  name: string
  description: string
  icon: string
  color: string
  streak: number
  lastCompleted: Date
  completedDates: Date[]
  createdAt: Date
}
```

### Security Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /habits/{habitId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## 🚧 Roadmap

- [ ] Community feed implementation
- [ ] Group challenges
- [ ] Habit analytics and insights
- [ ] Weekly/monthly reports
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] Social sharing
- [ ] Custom badge creation
- [ ] Habit templates
- [ ] Dark mode

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

## 📄 License

MIT License - feel free to use this project for learning or your own hackathons!

## 🎯 Hackathon Ready

This project is optimized for hackathon demos:
- ✅ Visually impressive
- ✅ Emotionally engaging
- ✅ Core features functional
- ✅ Modern tech stack
- ✅ Clean code structure
- ✅ Easy to set up

## 💡 Tips for Demo

1. **Pre-create some habits** before the demo
2. **Show the streak feature** by completing habits
3. **Highlight the leaderboard** for competitive aspect
4. **Emphasize the smooth animations** and glass UI
5. **Mention the community features** (coming soon)

---

Built with ❤️ for building better habits together!
