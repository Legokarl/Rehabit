# 🎨 Visual Guide - ReHabit Redesign

## 🌟 Color & Theme Reference

### Primary Colors
```
🟢 Neon Green: #00ff88 (Primary brand color)
⚫ Pure Black: #000000 (Main background)
🔲 Dark Gray: #0a0a0a - #1a1a1a (Cards & surfaces)
⚪ White: #ffffff (Primary text)
```

### Gradient Effects
- **Green Gradient**: `linear-gradient(135deg, #00ff88 0%, #00cc6d 100%)`
- **Orb Effect**: `radial-gradient(circle, rgba(0, 255, 136, 0.4) 0%, transparent 70%)`
- **Background**: Radial gradients with 15% green opacity at corners

---

## 📄 Page-by-Page Breakdown

### 1. Landing Page (/)

#### Header/Navigation
```
Logo (Left):        [Green Glowing Icon] ReHabit
Links (Center):     Features | Pricing | Stats | Login
CTA (Right):        [Green Glow Button] Get Started →
```

#### Hero Section
```
Left Side:
  - Badge: "Stop Losing Progress, Start Winning" ✨
  - Heading: "Start earning" (massive, bold)
  - Subtitle: Description text
  - Buttons: [Join Us] [See Pricing]

Right Side:
  - Animated 3D orb (rotating)
  - Floating stat cards:
    • Your XP: +250 (animated up/down)
    • Level: 15 (animated up/down)
```

#### Countdown Section
```
┌─────────────────────────────────────┐
│   Special Launch Offer Ending In:  │
│                                     │
│   [03]  [12]  [53]  [58]          │
│   DAYS  HOURS MINS  SECS           │
│                                     │
│   [Try for free] [I want to join]  │
└─────────────────────────────────────┘
```

#### How It Works
```
Step 1          Step 2          Step 3
[Icon]          [Icon]          [Icon]
Create          Track           Join
Habits          Progress        Community
```

#### Pricing Tiers
```
Copper      Bronze      Silver ⭐    Gold
$0/mo       $9/mo       $19/mo       $39/mo

[Features]  [Features]  [Features]   [Features]
• Item 1    • Item 1    • Item 1     • Item 1
• Item 2    • Item 2    • Item 2     • Item 2
...         ...         ...          ...

[Button]    [Button]    [Button]     [Button]
```

#### Stats Grid
```
┌─────────┬─────────┬─────────┬─────────┐
│ [Icon]  │ [Icon]  │ [Icon]  │ [Icon]  │
│ 15K+    │ 100K+   │ $50K+   │ 24/7    │
│ Active  │ Habits  │ XP      │ Support │
│ Users   │ Done    │ Earned  │         │
└─────────┴─────────┴─────────┴─────────┘
```

---

### 2. Dashboard (/dashboard)

#### Header
```
┌────────────────────────────────────────────────────────┐
│ [Logo] ReHabit    [XP Bar: ████░░░░ 50/100]  [250 XP] │
│        Level 3     Level 3                     [Logout]│
└────────────────────────────────────────────────────────┘
```

#### Welcome Section
```
Welcome back, John! 🚀
Let's build great habits together
```

#### Stats Cards
```
┌──────────┬──────────┬──────────┬──────────┐
│ 🔥       │ 🎯       │ 📈       │ ⭐       │
│ 7        │ 5        │ 250      │ 3        │
│ Best     │ Active   │ Total    │ Achieve- │
│ Streak   │ Habits   │ XP       │ ments    │
│ days     │ total    │ points   │ unlocked │
└──────────┴──────────┴──────────┴──────────┘
```

#### Tabs
```
[My Habits ✓]  [Leaderboard]  [Community]
```

#### Habit Cards (Grid View)
```
┌─────────────────────────────┐
│ 🎯 Morning Exercise    [×]  │
│    30 minutes of cardio     │
│                             │
│ 🔥 7 day streak             │
│ 📅 25 total                 │
│                             │
│ [✓ Completed Today!]        │
└─────────────────────────────┘
```

#### Leaderboard View
```
┌────────────────────────────────────┐
│ Top Performers 🏆        [🔴 LIVE] │
├────────────────────────────────────┤
│ 🥇 1  John Doe            2500 XP  │
│       Level 25                      │
├────────────────────────────────────┤
│ 🥈 2  Jane Smith          2300 XP  │
│       Level 23                      │
├────────────────────────────────────┤
│ 🥉 3  Bob Johnson         2100 XP  │
│       Level 21                      │
└────────────────────────────────────┘
```

---

### 3. Auth Page (/auth)

```
┌─────────────────────────────────────┐
│          [Logo] ReHabit             │
│   ✨ Join 15K+ Users Building       │
│      Better Habits                  │
│                                     │
│   Create your account               │
│                                     │
│ ┌─────────────────────────────┐   │
│ │                             │   │
│ │  [👤] Display Name         │   │
│ │  [📧] Email Address        │   │
│ │  [🔒] Password             │   │
│ │                             │   │
│ │  [Create Account →]         │   │
│ │                             │   │
│ │  ─── Or continue with ───   │   │
│ │                             │   │
│ │  [G Sign in with Google]    │   │
│ │                             │   │
│ │  Already have an account?   │   │
│ │  Sign In                    │   │
│ └─────────────────────────────┘   │
│                                     │
│         ← Back to Home              │
└─────────────────────────────────────┘
```

---

## 🎬 Animation Behaviors

### On Page Load
1. **Orbs**: Fade in and start floating (20s loop)
2. **Hero Content**: Slide up with fade (0.8s)
3. **Stats Cards**: Stagger fade-in (0.1s delay each)
4. **Countdown**: Numbers tick down every second

### On Hover
- **Buttons**: Scale 1.05 + glow intensifies
- **Cards**: Border glows + slight lift
- **Pricing Tiers**: Background brightens

### On Interaction
- **Habit Complete**: 
  1. Button changes to green
  2. XP notification flies in from right
  3. XP bar fills smoothly
  4. If level up → Full screen celebration modal

- **Add Habit**:
  1. Modal slides in with blur
  2. Icon grid scales on select
  3. Success → Modal slides out

---

## 🎯 Key Visual Patterns

### Glassmorphism Cards
```css
Background: rgba(0, 255, 136, 0.1)
Backdrop-blur: 20px
Border: 1px solid rgba(0, 255, 136, 0.2)
Shadow: 0 0 30px rgba(0, 255, 136, 0.4)
```

### Glow Effects
```css
Small Glow:  0 0 20px rgba(0, 255, 136, 0.3)
Large Glow:  0 0 50px rgba(0, 255, 136, 0.5)
Neon:        0 0 5px, 0 0 20px, 0 0 40px #00ff88
```

### Typography Hierarchy
```
H1: 80px, font-black, gradient text
H2: 48px, font-bold, white
H3: 32px, font-bold, white
Body: 16px, font-normal, gray-400
Small: 14px, font-medium, gray-500
```

---

## 📱 Responsive Breakpoints

```
Mobile:  < 768px  (1 column layouts)
Tablet:  768px+   (2 column layouts)
Desktop: 1024px+  (3-4 column layouts)
```

### Mobile Adjustments
- Single column for pricing tiers
- Stacked hero section
- Simplified stats cards
- Bottom sheet modals

---

## 🎨 Component States

### Buttons
```
Default:  Green gradient + glow
Hover:    Scale up + glow intensifies
Active:   Scale down slightly
Disabled: 50% opacity + no hover
Loading:  Spinning icon
```

### Input Fields
```
Default:  Dark bg + subtle border
Focus:    Green border + glow
Error:    Red border + error message
Success:  Green checkmark
```

### Cards
```
Default:  Subtle border + slight glow
Hover:    Brighter glow + lift effect
Selected: Green border + bright glow
```

---

## ✨ Special Effects

### Level Up Modal
- Full screen overlay with blur
- Trophy icon rotates 360° (3 times)
- Scale pulse animation
- Confetti-like background particles (implied)

### XP Gain Notification
- Slides in from top-right
- Green gradient background
- Auto-dismisses after 2s
- Smooth fade out

### Live Indicator (Leaderboard)
- Pulsing green dot
- "LIVE" text
- 2s pulse loop

---

## 🎯 Call-to-Action Hierarchy

### Primary CTAs (Green Glow)
- "Get Started"
- "Join Us"
- "Create Account"
- "Create Habit"
- "Mark Complete"

### Secondary CTAs (Glass)
- "See Pricing"
- "Learn More"
- "Cancel"
- "Sign in with Google"

### Tertiary CTAs (Text)
- "Back to Home"
- "Sign In/Sign Up toggle"
- Navigation links

---

## 🚀 Pro Tips

1. **Consistency**: All green elements use #00ff88
2. **Spacing**: 6-8 unit system (24px, 32px, 48px)
3. **Contrast**: White text on dark backgrounds
4. **Feedback**: Every action has visual feedback
5. **Performance**: CSS transforms for animations

---

**Remember**: The design is modern, premium, and professional while staying true to the habit-tracking purpose!
