# ❤️ Peter & Jess's Adventures

A gamified couples' adventure app — track quests, restaurants, recipes, memories, and bucket list items together.

---

## 🚀 Deploy to Vercel (Free) — Step by Step

### Prerequisites
- A free [GitHub](https://github.com) account
- A free [Vercel](https://vercel.com) account (sign up with GitHub)

### Step 1: Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Name it `peter-and-jess-adventures`
3. Keep it **Private** (only you can see the code)
4. Click **Create repository**

### Step 2: Upload the Project Files
1. On your new repo page, click **"uploading an existing file"**
2. Drag and drop **all the files and folders** from this project into the upload area
3. Make sure the structure looks like:
   ```
   peter-and-jess-adventures/
   ├── index.html
   ├── package.json
   ├── vite.config.js
   ├── tailwind.config.js
   ├── postcss.config.js
   ├── src/
   │   ├── main.jsx
   │   ├── App.jsx
   │   └── index.css
   └── public/
   ```
4. Click **Commit changes**

### Step 3: Deploy on Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import** next to your `peter-and-jess-adventures` repo
3. Vercel auto-detects it's a Vite project — **don't change any settings**
4. Click **Deploy**
5. Wait ~60 seconds ⏳
6. 🎉 You'll get a live URL like `peter-and-jess-adventures.vercel.app`

### Step 4: Share with Jess
- Send her the URL — it works beautifully on phones!
- Both of you can bookmark it and add it to your home screen for an app-like experience

---

## 📱 Add to Home Screen (feels like a real app)

### iPhone (Safari)
1. Open the URL in Safari
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **Add to Home Screen**
4. Tap **Add**

### Android (Chrome)
1. Open the URL in Chrome
2. Tap the **three dots** menu
3. Tap **Add to Home Screen**
4. Tap **Add**

---

## ⚠️ Important Note About Data

This app stores data in your browser's **localStorage**. This means:
- ✅ Data persists between visits on the **same device & browser**
- ❌ Data does NOT sync between Peter's phone and Jess's phone
- ❌ Clearing browser data will erase your progress

Each device keeps its own separate data. If you want shared data in the future, you'd need to add a backend database (like Firebase or Supabase).

---

## 🛠 Local Development (Optional)

If you want to run it locally or make changes:

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

Built with ❤️ using React, Vite, and Tailwind CSS.
