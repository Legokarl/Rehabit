# 🧪 Testing Checklist - ReHabit Features

Use this checklist to verify all new features are working correctly.

---

## ✅ Pre-Testing Setup

- [ ] Firebase is configured (check `.env.local`)
- [ ] Dependencies installed (`npm install`)
- [ ] Build successful (`npm run build`)
- [ ] Dev server running (`npm run dev`)
- [ ] Logged into the application

---

## 🎯 Feature Tests

### 1. XP System

#### Test: Earning XP
- [ ] Complete a habit
- [ ] Verify "+10 XP" notification appears in top-right
- [ ] Check XP counter in header increases by 10
- [ ] Verify notification disappears after ~2 seconds

#### Test: Losing XP
- [ ] Uncomplete a habit (click completed habit)
- [ ] Verify XP counter decreases by 10
- [ ] Verify XP doesn't go below 0

#### Test: XP Display
- [ ] Check header shows total XP with award icon
- [ ] Verify XP value is accurate

**Expected Results:**
- ✅ +10 XP per completion
- ✅ -10 XP per uncompletion
- ✅ Visual notification appears
- ✅ XP counter updates instantly

---

### 2. Leveling System

#### Test: Level Display
- [ ] Check header shows "Level X"
- [ ] Verify level matches XP (Level = floor(XP/100) + 1)

#### Test: Progress Bar
- [ ] Locate progress bar in header
- [ ] Verify shows "X/100 XP"
- [ ] Check bar fills as XP increases
- [ ] Verify bar is purple/pink gradient

#### Test: Level Up (Method 1: Quick Test)
- [ ] Note current level
- [ ] Complete 10 habits (100 XP)
- [ ] Verify level increases by 1
- [ ] Check level-up modal appears

#### Test: Level Up (Method 2: Existing XP)
If you have existing XP:
- [ ] Note current XP: _____ XP
- [ ] Calculate habits needed: (100 - (XP % 100)) / 10 = _____
- [ ] Complete that many habits
- [ ] Verify level up modal

#### Test: Level Up Modal
- [ ] Verify modal has animated trophy
- [ ] Check trophy rotates and scales
- [ ] Verify shows correct new level
- [ ] Check congratulatory message appears
- [ ] Click "Awesome!" button
- [ ] Verify modal closes

#### Test: Level Sync
- [ ] Log out
- [ ] Log back in
- [ ] Verify level still matches XP
- [ ] No level lost or desync

**Expected Results:**
- ✅ Level = floor(XP / 100) + 1
- ✅ Progress bar accurate
- ✅ Level up modal on milestone
- ✅ Level persists across sessions

---

### 3. Streak System

#### Test: Starting a Streak
- [ ] Create a new habit
- [ ] Complete it today
- [ ] Verify shows "1 day streak"

#### Test: Building a Streak
**Day 1:**
- [ ] Complete habit
- [ ] Verify "1 day streak"

**Day 2 (next day):**
- [ ] Complete same habit
- [ ] Verify "2 day streak"

**Day 3:**
- [ ] Complete same habit
- [ ] Verify "3 day streak"

#### Test: Streak Reset
**Option A - Skip a Day:**
- [ ] Build a 3+ day streak
- [ ] Wait until day after tomorrow
- [ ] Complete habit
- [ ] Verify streak resets to 1

**Option B - Uncompletion:**
- [ ] Build a 2+ day streak
- [ ] Uncomplete today's habit
- [ ] Verify streak decreases

#### Test: Multiple Habits
- [ ] Create 3 different habits
- [ ] Complete all 3 today
- [ ] Each should show "1 day streak"
- [ ] Verify streaks are independent

**Expected Results:**
- ✅ Consecutive days increase streak
- ✅ Missing a day resets streak
- ✅ Each habit tracks its own streak
- ✅ Streak count is accurate

---

### 4. Live Leaderboard

#### Test: Leaderboard Access
- [ ] Click "Leaderboard" tab
- [ ] Verify leaderboard loads
- [ ] Check shows top 10 users

#### Test: Live Indicator
- [ ] Verify green "Live" badge appears
- [ ] Check for pulsing green dot
- [ ] Verify dot animates (scales in/out)

#### Test: Auto-Refresh
- [ ] Note current leaderboard state
- [ ] Wait 30-35 seconds
- [ ] Watch for any updates
- [ ] (If other users active, see changes)

#### Test: Immediate Update
- [ ] View leaderboard
- [ ] Switch to "My Habits" tab
- [ ] Complete a habit (+10 XP)
- [ ] Switch back to "Leaderboard" tab
- [ ] Verify your XP updated

#### Test: Rankings
- [ ] Check top 3 users have highlighted backgrounds
- [ ] Position 1: Yellow/gold gradient
- [ ] Position 2: Silver/gray gradient
- [ ] Position 3: Orange/bronze gradient
- [ ] Positions 4-10: Standard background

#### Test: Display Information
Each leaderboard entry shows:
- [ ] Rank number (1-10)
- [ ] User display name
- [ ] User level
- [ ] User total XP

**Expected Results:**
- ✅ "Live" indicator visible
- ✅ Refreshes every 30 seconds
- ✅ Updates after completing habits
- ✅ Top 3 highlighted
- ✅ Sorted by XP (highest first)

---

### 5. Visual Feedback

#### Test: XP Gain Notification
- [ ] Complete a habit
- [ ] Notification appears top-right
- [ ] Shows "+10 XP"
- [ ] Has green gradient background
- [ ] Has award icon
- [ ] Animates in smoothly
- [ ] Disappears after ~2 seconds

#### Test: Progress Bar Animation
- [ ] Note current progress bar state
- [ ] Complete a habit
- [ ] Watch bar fill smoothly (animated)
- [ ] Verify reaches correct percentage

#### Test: Level Up Animation
- [ ] Reach 100/200/300/etc XP
- [ ] Modal appears with backdrop
- [ ] Trophy icon visible
- [ ] Trophy rotates 360°
- [ ] Trophy scales up and down (repeats)
- [ ] Shows "Level Up!" text
- [ ] Shows new level number (large)
- [ ] Shows congratulatory message

**Expected Results:**
- ✅ All animations smooth
- ✅ No lag or glitches
- ✅ Visuals appealing
- ✅ Feedback immediate

---

## 🐛 Bug Checks

### Common Issues to Test

#### Memory Leaks
- [ ] Open dashboard
- [ ] Wait 5 minutes
- [ ] Check browser performance
- [ ] No memory issues

#### Multiple Completions
- [ ] Complete same habit multiple times rapidly
- [ ] Verify only counts once per day
- [ ] XP doesn't multiply incorrectly

#### Negative XP
- [ ] Have low XP (e.g., 20 XP)
- [ ] Uncomplete 3 habits
- [ ] Verify XP doesn't go negative
- [ ] Should stop at 0 XP

#### Streak Edge Cases
- [ ] Complete habit at 11:59 PM
- [ ] Complete same habit at 12:01 AM
- [ ] Verify counts as 2 different days
- [ ] Streak should increase

#### Logout/Login
- [ ] Complete habits, earn XP
- [ ] Log out
- [ ] Log back in
- [ ] Verify all data persists
- [ ] XP, level, streaks intact

---

## 📊 Data Accuracy Tests

### XP Calculations

Test this formula: `Level = floor(XP / 100) + 1`

| XP | Expected Level | Actual Level | Pass/Fail |
|----|---------------|--------------|-----------|
| 0 | 1 | _____ | _____ |
| 50 | 1 | _____ | _____ |
| 99 | 1 | _____ | _____ |
| 100 | 2 | _____ | _____ |
| 150 | 2 | _____ | _____ |
| 200 | 3 | _____ | _____ |
| 500 | 6 | _____ | _____ |
| 999 | 10 | _____ | _____ |
| 1000 | 11 | _____ | _____ |

### Streak Calculations

| Scenario | Expected Streak | Actual Streak | Pass/Fail |
|----------|----------------|---------------|-----------|
| Completed today only | 1 | _____ | _____ |
| Completed today + yesterday | 2 | _____ | _____ |
| Completed 5 consecutive days | 5 | _____ | _____ |
| Completed today, skipped yesterday | 1 | _____ | _____ |
| Completed 3 days ago (not since) | 0 | _____ | _____ |

---

## 🎨 UI/UX Tests

### Responsiveness
- [ ] Test on desktop (1920x1080)
- [ ] Test on laptop (1366x768)
- [ ] Test on tablet (iPad)
- [ ] Test on mobile (375x667)
- [ ] All elements visible and usable

### Accessibility
- [ ] Tab through interface (keyboard navigation)
- [ ] All buttons clickable
- [ ] Text readable
- [ ] Sufficient color contrast

### Performance
- [ ] Page loads in < 3 seconds
- [ ] Animations smooth (60fps)
- [ ] No lag when completing habits
- [ ] Leaderboard updates don't freeze UI

---

## ✨ Final Verification

### Complete User Flow
1. [ ] Create account / Log in
2. [ ] Create 3 different habits
3. [ ] Complete all 3 habits
4. [ ] Verify earned 30 XP total
5. [ ] Check progress bar shows 30/100
6. [ ] View leaderboard
7. [ ] Wait and see auto-refresh
8. [ ] Complete 7 more habits (total 10)
9. [ ] Verify level-up to Level 2
10. [ ] Check level shows as "Level 2"
11. [ ] Verify progress bar reset to 0/100
12. [ ] Complete habit tomorrow
13. [ ] Verify streak increases
14. [ ] Log out and log back in
15. [ ] Verify all data persisted

---

## 📝 Test Results Summary

**Test Date:** _______________  
**Tester:** _______________  
**Environment:** _______________  
**Browser:** _______________

### Results

- Total Tests: 100+
- Passed: _____ / _____
- Failed: _____ / _____
- Pass Rate: _____% 

### Critical Issues Found

1. _________________________________
2. _________________________________
3. _________________________________

### Minor Issues Found

1. _________________________________
2. _________________________________
3. _________________________________

### Notes

_________________________________________
_________________________________________
_________________________________________
_________________________________________

---

## ✅ Sign-Off

- [ ] All critical features working
- [ ] No major bugs found
- [ ] Performance acceptable
- [ ] Ready for production

**Approved by:** _______________  
**Date:** _______________

---

## 🆘 Troubleshooting

### XP not updating
- Check browser console for errors
- Verify Firebase connection
- Check internet connection
- Clear cache and reload

### Level not calculating
- Check XP value
- Log out and log back in
- Level should auto-recalculate

### Leaderboard not loading
- Check Firebase Firestore rules
- Verify users collection exists
- Check console for errors

### Streaks resetting incorrectly
- Check device date/time is correct
- Verify timezone settings
- Complete habit in same timezone

---

**Happy Testing! 🎉**

Report any issues found during testing for immediate resolution.

