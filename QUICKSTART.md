# Quick Start Guide - Stratego Multiplayer Backend

## 🚀 Get Started in 5 Minutes

### Step 1: Set Up Firebase (2 min)
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Create a project"** → name it `stratego-arena`
3. Create a Web App in the project
4. Copy your Firebase config and paste into `src/lib/firebase.js`

### Step 2: Enable Services (1 min)
In Firebase Console:
- **Authentication** → Enable "Email/Password"
- **Firestore** → Create database in test mode

### Step 3: Deploy Security Rules (1 min)
```bash
npm install -g firebase-tools  # If not installed
firebase login
firebase use --add             # Select your project
firebase deploy --only firestore:rules
```

### Step 4: Run Locally (1 min)
```bash
npm run dev
# Open http://localhost:5173
```

### Step 5: Test It! 
1. Sign up at `/auth`
2. Go to lobby `/lobby`
3. Create a game
4. Open in another browser/incognito → Join game
5. Play! 🎮

## What Just Happened?

Your Stratego game now has:
- **Real multiplayer** - Two players on different devices
- **Persistent storage** - Games saved in cloud
- **Live updates** - Moves sync instantly
- **Secure** - Only players in game can see/play it

## File Changes Overview

| File | Change |
|------|--------|
| `src/lib/firestoreGameService.js` | NEW - Game backend |
| `src/lib/AuthContext.jsx` | UPDATED - Firebase auth |
| `src/pages/Auth.jsx` | NEW - Login page |
| `src/pages/Lobby.jsx` | UPDATED - Game lobby |
| `src/pages/OnlineGame.jsx` | UPDATED - Multiplayer game |
| `src/App.jsx` | UPDATED - Routing |
| `firestore.rules` | NEW - Security rules |

## Deployment

### Option A: Firebase Hosting (Easiest)
```bash
npm run build
firebase deploy
```

### Option B: Vercel/Netlify
```bash
npm run build
# Deploy dist/ folder to your hosting
```

## Common Issues

**"Can't sign up"**
- Check Firebase Authentication is enabled in console
- Try another email address

**"Games not appearing"**
- Deploy security rules: `firebase deploy --only firestore:rules`
- Refresh page

**"Real-time updates lagging"**
- Normal on slow connections
- Should update within 1-2 seconds

**"Permission denied" errors**
- Must be logged in
- Must be a player in the game
- Check security rules are deployed

## Next Steps

1. ✅ Deploy to production (see Deployment section)
2. 📝 Share the game link with friends
3. 🎮 Play multiplayer games!
4. 📊 Add features (see BACKEND_IMPLEMENTATION.md for ideas)

## Need Help?

See full documentation:
- **Setup Details**: [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
- **Implementation**: [BACKEND_IMPLEMENTATION.md](BACKEND_IMPLEMENTATION.md)
- **API Reference**: [FIREBASE_SETUP.md](FIREBASE_SETUP.md#api-reference)

## Environment Variables (Optional)

Create `.env` file:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

Then update `src/lib/firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... other fields
};
```

## Key Features

✅ Multiplayer gameplay  
✅ Real-time synchronization  
✅ User authentication  
✅ Game persistence  
✅ Battle resolution  
✅ Move validation  
✅ Secure database  

Let's play! 🎲♟️
