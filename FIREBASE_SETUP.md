# Firebase Multiplayer Stratego Backend - Setup Guide

## Overview
Your Stratego game now has a complete Firebase-powered multiplayer backend with:
- ✅ Firestore database for game state management
- ✅ Firebase Authentication for user sign-in
- ✅ Real-time game synchronization
- ✅ Security rules to protect player data
- ✅ Multiplayer lobby system

## Step 1: Set Up Firebase Project

### Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `stratego-arena` (or your choice)
4. Select your region
5. Accept terms and create

### Create a Web App
1. In Firebase Console, click "Add app" → "Web"
2. Register your web app with name like `Stratego-Arena`
3. Copy the Firebase config object
4. Update [src/lib/firebase.js](src/lib/firebase.js) with your config

## Step 2: Configure Firebase Services

### Enable Authentication
1. In Firebase Console → Authentication
2. Click "Get started"
3. Enable "Email/Password" provider
4. (Optional) Enable "Google" for easier sign-in

### Create Firestore Database
1. In Firebase Console → Firestore Database
2. Click "Create database"
3. Select "Start in test mode" (for development)
   - **Important**: Update security rules before production!
4. Select region close to your users
5. Create the database

### Enable Hosting (Optional)
For deploying the frontend:
1. Firebase Console → Hosting
2. Follow CLI setup to deploy

## Step 3: Deploy Firestore Security Rules

### Deploy via Firebase CLI
```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set your project
firebase use --add

# Select your Firebase project

# Deploy rules
firebase deploy --only firestore:rules
```

### Rules File Location
The security rules are in [firestore.rules](firestore.rules)

**Key Security Features:**
- Only authenticated users can create games
- Only players in a game can view/modify it
- Nobody can read other players' private data
- Moves are immutable once created

## Step 4: Update Environment Configuration

### Update firebase.js
Edit [src/lib/firebase.js](src/lib/firebase.js):
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Get these values from Firebase Console → Project Settings → Web App

## Step 5: Test Locally

```bash
# Install dependencies (if needed)
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

## Step 6: Deploy to Production

### Option A: Firebase Hosting
```bash
npm run build
firebase deploy
```

### Option B: Other Hosting (Vercel, Netlify, etc.)
```bash
npm run build
# Deploy the dist/ folder to your hosting
```

## Firestore Database Schema

### Collections

#### `games` Collection
Stores all game sessions:
```javascript
{
  id: string,                    // Unique game ID
  createdBy: string,            // User ID of game creator
  createdByName: string,        // Display name
  redPlayer: string,            // Red player user ID
  redPlayerName: string,        // Red player display name
  bluePlayer: string | null,    // Blue player user ID
  bluePlayerName: string | null,
  status: "waiting" | "setup" | "playing" | "finished",
  redSetupComplete: boolean,
  blueSetupComplete: boolean,
  board: string,                // JSON-encoded 10x10 board state
  redSetup: array,              // Piece setup order for red
  blueSetup: array,             // Piece setup order for blue
  currentTurn: "red" | "blue" | null,
  winner: "red" | "blue" | null,
  moveCount: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `games/{gameId}/moves` Subcollection
Stores all moves in a game:
```javascript
{
  moveNumber: number,
  player: "red" | "blue",
  from: { row: number, col: number },
  to: { row: number, col: number },
  battleResult: {
    attacker: piece,
    defender: piece,
    result: "attacker" | "defender" | "both"
  } | null,
  timestamp: timestamp
}
```

## API Reference

### Game Management

#### Create Game
```javascript
const gameId = await createGame(userId, playerName);
```

#### Join Game
```javascript
await joinGame(gameId, userId, playerName);
```

#### Get Game
```javascript
const game = await getGame(gameId);
```

#### Get Available Games
```javascript
const games = await getAvailableGames(); // All waiting games
```

#### Get Player's Games
```javascript
const games = await getPlayerGames(userId); // Setup & playing games
```

### Gameplay

#### Submit Setup
```javascript
await submitSetup(gameId, userId, setupArray, color);
// setupArray: [PIECE_TYPE, PIECE_TYPE, ...]  in order
// color: "red" | "blue"
```

#### Make Move
```javascript
const result = await makeMove(gameId, userId, {
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
});
// Returns: { battleResult, winner, board }
```

#### Resign
```javascript
await resignGame(gameId, userId);
// Sets winner to opponent
```

### Real-time Updates

#### Subscribe to Game Changes
```javascript
const unsubscribe = subscribeToGame(gameId, (game) => {
  // Called whenever game data changes
  console.log('Game updated:', game);
});

// Later, stop listening:
unsubscribe();
```

#### Get Move History
```javascript
const moves = await getGameHistory(gameId);
```

## Authentication Setup

### Sign Up
```javascript
import { useAuth } from '@/lib/AuthContext';

const { register } = useAuth();
await register(email, password, displayName);
```

### Sign In
```javascript
import { useAuth } from '@/lib/AuthContext';

const { login } = useAuth();
await login(email, password);
```

### Sign Out
```javascript
import { useAuth } from '@/lib/AuthContext';

const { logout } = useAuth();
await logout();
```

### Get Current User
```javascript
import { useAuth } from '@/lib/AuthContext';

const { user, isAuthenticated } = useAuth();
```

## Troubleshooting

### "Permission denied" errors
- Check security rules are deployed: `firebase deploy --only firestore:rules`
- Ensure user is authenticated
- Verify game collection structure

### Real-time updates not working
- Check Firestore listeners are set up with `subscribeToGame()`
- Verify network connection
- Check browser console for errors

### Authentication not persisting
- Firebase SDK handles persistence automatically
- Check browser cookies/storage are enabled
- Clear browser cache if issues persist

### Game not saving moves
- Verify `makeMove()` function is called with correct parameters
- Check user is authenticated
- Ensure user is actually a player in the game

## Production Checklist

- [ ] Update Firebase security rules (disable test mode)
- [ ] Enable required Firebase services (Auth, Firestore)
- [ ] Set up environment variables for Firebase config
- [ ] Deploy to production hosting
- [ ] Test multiplayer game flow
- [ ] Monitor Firestore usage and costs
- [ ] Set up billing alerts

## Next Steps

1. **Add User Profiles**: Store player stats and history
2. **Game Statistics**: Track wins/losses, ELO rating
3. **In-game Chat**: Real-time messaging between players
4. **Rematch System**: Quick rematches with previous opponent
5. **Replay System**: Save and watch game replays
6. **Tournaments**: Bracket-based competitive play

## Support & Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Stratego Rules](https://www.stratego.com/rules)
