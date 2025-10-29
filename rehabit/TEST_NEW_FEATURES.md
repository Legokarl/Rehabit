# 🧪 Test New Features - Quick Guide

## ✅ Server Restarted!

All new features are now live. Here's how to test them:

---

## 🔍 1. Test "Delete for Me" (FIXED)

### **Steps:**
1. Open your app in browser
2. Go to **Explore Community** tab
3. Join or open any group you didn't create
4. Click **⋮** (three dots) in chat header
5. Click **"Delete for Me"** (orange)
6. Confirm deletion

### **Expected Result:**
✅ Group disappears **immediately**
✅ No page refresh needed
✅ Group removed from your list
✅ Console shows: "Group hidden successfully" + "User data refreshed"

### **Before the Fix:**
❌ Had to refresh page
❌ Group would reappear
❌ User data not synced

---

## 📤 2. Test WhatsApp Sharing

### **Steps:**
1. Open any group chat
2. Click **⋮** (three dots)
3. Click **"Share via WhatsApp"** (green with chat icon)

### **Expected Result:**
✅ WhatsApp opens (web or mobile app)
✅ Pre-filled message appears:
```
Hey! Join our group "Group Name" on Rehabit!

[Group Description]

https://yourapp.com/join-group/[groupId]
```
✅ You can select contacts to share with

---

## ✈️ 3. Test Telegram Sharing

### **Steps:**
1. Open any group chat
2. Click **⋮** (three dots)
3. Click **"Share via Telegram"** (blue with send icon)

### **Expected Result:**
✅ Telegram opens (web or mobile app)
✅ Message with invite link ready
✅ You can select chats to share with

---

## 📲 4. Test Generic Share

### **Steps:**
1. Open any group chat
2. Click **⋮** (three dots)
3. Click **"Share..."** (gray with share icon)

### **Expected Result (Mobile):**
✅ Native share sheet appears
✅ Shows all available apps (SMS, Email, etc.)
✅ Can share to any app

### **Expected Result (Desktop):**
✅ Link copied to clipboard
✅ Alert: "Link copied to clipboard!"
✅ Can paste anywhere

---

## 🗂️ 5. Test Complete Menu

### **As Regular Member:**

Click **⋮** on a group you didn't create. You should see:

```
┌─────────────────────────────┐
│ SHARING SECTION             │
├─────────────────────────────┤
│ 🔗 Copy Invite Link         │
│ 💬 Share via WhatsApp       │
│ ✈️  Share via Telegram       │
│ 📤 Share...                  │
├─────────────────────────────┤
│ MEMBER ACTIONS              │
├─────────────────────────────┤
│ 👋 Leave Group              │
│ 🗑️  Delete for Me            │
└─────────────────────────────┘
```

**Verify:**
- [ ] See 6 total options
- [ ] Sections separated by borders
- [ ] Colors match (green, blue, yellow, orange)
- [ ] NO "Delete Group" option

---

### **As Group Creator:**

Click **⋮** on a group you created. You should see:

```
┌─────────────────────────────┐
│ SHARING SECTION             │
├─────────────────────────────┤
│ 🔗 Copy Invite Link         │
│ 💬 Share via WhatsApp       │
│ ✈️  Share via Telegram       │
│ 📤 Share...                  │
├─────────────────────────────┤
│ ADMIN ACTIONS               │
├─────────────────────────────┤
│ 🗑️  Delete Group (RED)       │
└─────────────────────────────┘
```

**Verify:**
- [ ] See 5 total options
- [ ] Sharing section + Admin section
- [ ] "Delete Group" in RED
- [ ] NO "Leave Group" or "Delete for Me"

---

## 👋 6. Test Leave Group

### **Steps:**
1. Join a group (or use existing membership)
2. Click **⋮** → **"Leave Group"** (yellow)
3. Confirm in modal

### **Expected Result:**
✅ System message appears: "Your Name left the group"
✅ You're removed from members list
✅ Group still visible in your list
✅ "Chat" button changes to "Join" button
✅ Can click "Join" to rejoin anytime

---

## 🗑️ 7. Test Delete Group (Admin Only)

### **Steps:**
1. Open a group YOU created
2. Click **⋮** → **"Delete Group"** (red)
3. Confirm in modal

### **Expected Result:**
✅ Console logs show:
```
Starting group deletion: [id]
Fetching messages to delete...
Found X messages to delete
All messages deleted
Group document deleted successfully
```
✅ Group disappears from EVERYONE's view
✅ Success alert appears
✅ No errors in console

### **If You Get Permission Error:**
- Firestore rules not deployed yet
- See: `DEPLOY_FIRESTORE_RULES_MANUAL.md`
- Deploy rules via Firebase Console

---

## 🎨 8. Visual Check

### **Menu Appearance:**
- [ ] Dark glass background
- [ ] Teal/cyan border
- [ ] Large shadow (floating effect)
- [ ] Positioned below ⋮ button
- [ ] Right-aligned
- [ ] No overlap with chat

### **Button Hover:**
- [ ] Hover changes background to lighter
- [ ] Smooth transition
- [ ] Icons + text aligned properly
- [ ] Proper spacing between options

### **Color Verification:**
- [ ] Copy Link: Primary (cyan/teal)
- [ ] WhatsApp: Green
- [ ] Telegram: Blue
- [ ] Share: Gray
- [ ] Leave: Yellow
- [ ] Delete for Me: Orange
- [ ] Delete Group: Red

---

## 🔍 Debug Mode

### **Open Browser Console (F12):**

1. Click **⋮** on any group
2. Try each option
3. Watch console logs

### **For "Delete for Me":**
```
Deleting group for me: [groupId]
Updating user document to hide group...
Group hidden successfully
User data refreshed  ← ✅ NEW!
```

### **For WhatsApp:**
```
(Opens WhatsApp - no console logs expected)
```

### **For Telegram:**
```
(Opens Telegram - no console logs expected)
```

---

## ⚡ Quick Test Sequence

**5-Minute Full Test:**

1. **Join a group** (or use existing)
2. **Click ⋮** → Check all options visible
3. **Click "Copy Invite Link"** → Link appears
4. **Click "Share via WhatsApp"** → WhatsApp opens
5. **Close WhatsApp**, back to app
6. **Click ⋮** → **"Share via Telegram"** → Telegram opens
7. **Close Telegram**, back to app
8. **Click ⋮** → **"Delete for Me"** → Confirm
9. **Check:** Group disappears immediately ✅
10. **Get invite link** from a friend OR create new group
11. **Test rejoin** via invite link

---

## 🐛 Common Issues & Fixes

### **Issue 1: WhatsApp doesn't open**
**Cause:** Browser blocked popup
**Fix:** Allow popups for your domain in browser settings

---

### **Issue 2: Telegram doesn't open**
**Cause:** Telegram not installed
**Fix:** Opens Telegram Web instead (works fine)

---

### **Issue 3: "Delete for Me" doesn't work**
**Cause:** Firestore rules
**Fix:** 
1. Check console for error
2. Verify user document has write permission
3. Try logging out and back in

---

### **Issue 4: "Delete Group" permission denied**
**Cause:** Firestore rules not deployed
**Fix:**
1. Go to Firebase Console
2. Firestore → Rules
3. Copy from `rehabit/firestore.rules`
4. Publish
5. Wait 1 minute
6. Try again

---

### **Issue 5: Menu not appearing**
**Cause:** JavaScript error
**Fix:**
1. Check browser console (F12)
2. Look for red errors
3. Hard refresh: Ctrl + Shift + R

---

## 📊 Feature Status

| Feature | Status | Works On |
|---------|--------|----------|
| Copy Invite Link | ✅ Live | All devices |
| Share WhatsApp | ✅ Live | All devices |
| Share Telegram | ✅ Live | All devices |
| Generic Share | ✅ Live | All devices |
| Leave Group | ✅ Live | All devices |
| Delete for Me | ✅ **FIXED** | All devices |
| Delete Group | ⏳ Needs rules | All devices |

---

## 🎉 Success Criteria

**All tests pass if:**

✅ Menu opens without errors
✅ All options visible (role-based)
✅ Colors match specification
✅ WhatsApp sharing works
✅ Telegram sharing works
✅ Delete for Me works instantly
✅ Groups disappear immediately
✅ No page refresh needed
✅ Can rejoin via invite
✅ Leave posts system message
✅ Delete Group works (after rules deployed)

---

## 📞 Need Help?

**If any test fails:**

1. **Check browser console** (F12)
2. **Copy error message**
3. **Note which feature failed**
4. **Try these quick fixes:**
   - Hard refresh (Ctrl + Shift + R)
   - Log out and log in
   - Clear browser cache
   - Try incognito mode

**Documentation:**
- `DROPDOWN_MENU_COMPLETE.md` - Full feature guide
- `DEPLOY_FIRESTORE_RULES_MANUAL.md` - Deploy rules
- `TROUBLESHOOTING_GROUPS.md` - Debug guide

---

**Happy testing! 🚀**

