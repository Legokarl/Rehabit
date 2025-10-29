# 🔍 Debugging Gemini AI Issues

## How to See What's Happening

### Step 1: Check Server Console (Terminal)
Look at your terminal where `npm run dev` is running. You'll see:

```
🔑 API Key status: Present
📝 Prompt received: Generate a creative...
🚀 Trying model: gemini-2.5-flash...
📦 Gemini response: {...}
📝 Generated text: [ACTUAL TEXT FROM AI]
🧹 Cleaned text: [CLEANED VERSION]
✅ Parsed challenge data: {...}
```

### Step 2: Check Browser Console (F12)
1. Press **F12** in your browser
2. Go to **Console** tab
3. Click "Generate AI Challenge"
4. Look for messages showing what's happening

---

## Common Issues & Fixes

### Issue 1: "Invalid JSON format"
**Cause:** AI returned text that's not proper JSON

**What to look for in terminal:**
```
📝 Generated text: Here's a challenge: {some text}
❌ JSON parse error: Unexpected token 'H'
```

**Fix:** Click the button again - it will try a different model

---

### Issue 2: "Missing required fields"
**Cause:** AI returned JSON but forgot some fields

**What to look for:**
```
✅ Parsed challenge data: { title: "...", description: "..." }
❌ Missing required fields: goal, xpReward, difficulty
```

**Fix:** Click again - the prompt will guide the AI better

---

### Issue 3: "Model is overloaded"
**Cause:** Google's servers are busy

**What to look for:**
```
🚀 Trying model: gemini-2.5-flash...
⚠️ Model gemini-2.5-flash failed: 503
🔄 Trying next model...
```

**Fix:** System automatically tries 4 models - just wait

---

## Share the Logs

If you keep getting errors, share these from your **terminal**:

1. The `📝 Generated text:` line (shows raw AI output)
2. The `🧹 Cleaned text:` line (shows what we tried to parse)
3. Any `❌ Error` lines

This will help identify exactly what's going wrong!

---

## Manual Test

Want to test your API key directly? Run this in terminal:

```bash
cd rehabit
node -e "
const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCsypz9NeFp4aQ2QfN1QGcEXI02Yn-XC7Y';
fetch(\`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=\${apiKey}\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'Return only this JSON: {\"test\": \"working\"}' }] }]
  })
}).then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)));
"
```

This should return JSON with `"test": "working"` if your API key works.

