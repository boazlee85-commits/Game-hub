# Stratego Arena - Multiplayer Backend Implementation ✅

## What's New

Your Stratego game now has a **complete Firebase-powered multiplayer backend**! Players can now:
- ✅ Sign up and log in with email/password
- ✅ Create new games and wait for opponents
- ✅ Join existing games from the lobby
- ✅ Play real-time multiplayer matches
- ✅ See live opponent moves and updates
- ✅ Complete game history and winner tracking

## New Files Created

### Backend Services
- **[src/lib/firestoreGameService.js](src/lib/firestoreGameService.js)** - Game management API
  - Create games, join games, submit setups
  - Make moves, track game state
  - Real-time listeners and history

### Authentication
- **[src/lib/AuthContext.jsx](src/lib/AuthContext.jsx)** - Firebase authentication (UPDATED)
  - Sign up, sign in, sign out
  - User session management
  - Real-time auth state

- **[src/pages/Auth.jsx](src/pages/Auth.jsx)** - Login/signup UI (NEW)
  - Beautiful authentication page
  - Toggle between login and signup modes
  - Integrated with Firebase Auth

### Game UI
- **[src/pages/Lobby.jsx](src/pages/Lobby.jsx)** - Game lobby (UPDATED)
  - View your active games
  - Browse available games to join
  - Create new games
  - Real-time updates every 3 seconds

- **[src/pages/OnlineGame.jsx](src/pages/OnlineGame.jsx)** - Game board (UPDATED)
  - Real-time multiplayer gameplay
  - Setup phase coordination
  - Move validation and battle resolution
  - Game over detection

### Security & Configuration
- **[firestore.rules](firestore.rules)** - Database security rules (NEW)
  - Only authenticated users can create games
  - Players can only access/modify their own games
  - Moves are immutable once created

- **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** - Complete setup guide (NEW)
  - Step-by-step Firebase configuration
  - Database schema documentation
  - API reference
  - Troubleshooting guide

### Modified Files
- **[src/App.jsx](src/App.jsx)** - Updated routing
  - Added /auth route for authentication
  - Added ProtectedRoute wrapper
  - Changed /online/:id → /game/:id

- **[src/main.jsx](src/main.jsx)** - Added AuthProvider
  - Wraps app with authentication context
  - Enables Firebase auth throughout app

- **[src/components/ProtectedRoute.jsx](src/components/ProtectedRoute.jsx)** - Simplified
  - Works with Firebase authentication
  - Redirects to /auth if not logged in

## How It Works

### Game Flow

1. **Sign Up/Login**
   - User visits `/auth`
   - Creates account or logs in
   - Redirected to `/lobby`

2. **Create or Join Game**
   - View available games in lobby
   - Create new game (you become Red player)
   - Or join existing game (you become Blue player)
   - Navigated to `/game/{gameId}`

3. **Setup Phase**
   - Both players arrange their pieces
   - Auto-setup or manual placement available
   - Click "Ready!" when done
   - Game starts when both players ready

4. **Gameplay**
   - Red player moves first
   - Click piece to select, then click destination
   - Battles resolved automatically
   - Real-time updates for opponent moves
   - Game ends when flag captured or no movable pieces

5. **Game Over**
   - Winner displayed
   - Can start new game from lobby

## Architecture

```
Firebase Cloud (Backend)
├── Authentication
│   └── Email/Password sign-in
├── Firestore Database
│   ├── games/ collection
│   │   ├── Game metadata
│   │   ├── Board state
│   │   └── moves/ subcollection (per game)
│   └── Real-time listeners
└── Security Rules
    └── Enforce player access control
```

## Key Features

### Real-time Synchronization
```javascript
// Automatically updates when opponent makes move
subscribeToGame(gameId, (game) => {
  setGame(game); // Component re-renders instantly
});
```

### Secure Moves
```javascript
// Server validates:
// - User is authenticated
// - User is player in game
// - It's their turn
// - Move is legal
const result = await makeMove(gameId, userId, {
  fromRow, fromCol, toRow, toCol
});
```

### Persistent Game State
- All games saved to Firestore
- Complete move history tracked
- Can resume games anytime
- Works across browser sessions

## Next Steps to Deploy

### 1. Set Up Firebase Project
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Create project or use existing
firebase use --add
```

### 2. Enable Firebase Services
- Go to [Firebase Console](https://console.firebase.google.com/)
- Create new project
- Enable **Authentication** → Email/Password
- Create **Firestore** database
- Get Web Config (for firebase.js)

### 3. Update Firebase Config
Edit `src/lib/firebase.js` with your credentials from Firebase Console

### 4. Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

### 5. Test Locally
```bash
npm run dev
# Open http://localhost:5173
```

### 6. Deploy to Production
```bash
npm run build
firebase deploy
# OR deploy dist/ folder to Vercel/Netlify
```

## Database Schema

### Games Collection
```javascript
{
  id: "game_abc123",
  createdBy: "user_id_1",
  createdByName: "Alice",
  redPlayer: "user_id_1",
  redPlayerName: "Alice",
  bluePlayer: "user_id_2",
  bluePlayerName: "Bob",
  status: "playing",
  redSetupComplete: true,
  blueSetupComplete: true,
  board: "[[{...}, {...}], ...]",  // JSON string
  redSetup: ["MARSHAL", "GENERAL", "COLONEL", ...],
  blueSetup: ["MARSHAL", "GENERAL", "COLONEL", ...],
  currentTurn: "red",
  winner: null,  // "red" or "blue" when finished
  moveCount: 42,
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:45:30Z"
}
```

### Moves Subcollection (per game)
```javascript
{
  moveNumber: 42,
  player: "red",
  from: { row: 6, col: 3 },
  to: { row: 5, col: 3 },
  battleResult: {
    attacker: { type: "SERGEANT", player: "red", revealed: true },
    defender: { type: "CAPTAIN", player: "blue", revealed: true },
    result: "attacker"  // "attacker" | "defender" | "both"
  },
  timestamp: "2024-01-15T10:45:30Z"
}
```

## API Reference

### Game Management
```javascript
import {
  createGame,           // Create new game
  joinGame,            // Join existing game
  getGame,             // Fetch game state
  getAvailableGames,   // List open games
  getPlayerGames,      // User's active games
  deleteGame,          // Remove game
  resignGame,          // Forfeit game
  subscribeToGame,     // Real-time updates
  getGameHistory,      // View move history
} from '@/lib/firestoreGameService';
```

### Authentication
```javascript
import { useAuth } from '@/lib/AuthContext';

// In component:
const {
  user,               // Current user object
  isAuthenticated,    // Boolean
  isLoadingAuth,      // Loading state
  authError,          // Error message
  register,           // (email, password, name) → Promise
  login,              // (email, password) → Promise
  logout,             // () → Promise
} = useAuth();
```

## Security

### Firestore Rules
- Only authenticated users can create/join games
- Players can only see games they're in
- Moves are immutable (can't be edited)
- Can't modify opponent's data

### Best Practices
- Never expose private keys in client code ✅ (Using Firebase config only)
- All user input validated server-side ✅ (Via security rules)
- Game logic computed deterministically ✅ (Same result every time)
- Sensitive data protected ✅ (Security rules enforce access)

## Troubleshooting

### "Authentication not working"
- Make sure `AuthProvider` is in `main.jsx`
- Firebase config is correct in `src/lib/firebase.js`
- Check Firebase Console → Authentication → Email/Password is enabled

### "Games not saving"
- Deploy security rules: `firebase deploy --only firestore:rules`
- Verify Firestore database exists
- Check browser console for errors

### "Real-time updates not working"
- Check `subscribeToGame()` is called
- Verify network connection
- Look at browser DevTools console

### "Permission denied" errors
- User must be authenticated (logged in)
- User must be a player in the game
- Security rules must be deployed

## Performance Tips

1. **Firestore Indexes** - Auto-created for common queries
2. **Real-time Listeners** - Only subscribe when needed
3. **Batch Operations** - Use `writeBatch()` for multiple updates
4. **Caching** - React Query handles client-side caching

## What's NOT Included Yet

These would be great additions:
- [ ] User profiles & stats
- [ ] Leaderboard/rankings
- [ ] Player ratings (ELO system)
- [ ] Game replay system
- [ ] In-game chat
- [ ] Spectator mode
- [ ] Time controls
- [ ] Mobile-optimized UI
- [ ] Offline play with sync

## Files Structure

```
Stratego Arena/
├── src/
│   ├── lib/
│   │   ├── firebase.js                 (Firebase config)
│   │   ├── AuthContext.jsx             (Auth provider) ✨
│   │   ├── firestoreGameService.js     (Game API) ✨
│   │   └── strategoEngine.js           (Game logic)
│   ├── pages/
│   │   ├── Auth.jsx                    (Login page) ✨
│   │   ├── Lobby.jsx                   (Game lobby) ✨
│   │   ├── OnlineGame.jsx              (Gameplay) ✨
│   │   └── ...
│   ├── components/
│   │   ├── ProtectedRoute.jsx          (Auth guard) ✨
│   │   ├── game/
│   │   └── ...
│   ├── App.jsx                         (Routing) ✨
│   └── main.jsx                        (Entry point) ✨
├── firestore.rules                     (Security) ✨
├── firebase.json                       (Firebase config)
├── FIREBASE_SETUP.md                   (Setup guide) ✨
└── README.md
```

✨ = Modified or created by this update

## Support

- 📖 [Firebase Docs](https://firebase.google.com/docs)
- 🔐 [Security Rules Guide](https://firebase.google.com/docs/rules)
- 🎮 [Stratego Rules](https://www.stratego.com/rules)
- 💬 [React Documentation](https://react.dev)

## Summary

Your Stratego game now has:
- ✅ Complete multiplayer backend
- ✅ Real-time synchronization
- ✅ Secure authentication
- ✅ Database persistence
- ✅ Beautiful UI ready to deploy

**Next step**: Follow [FIREBASE_SETUP.md](FIREBASE_SETUP.md) to configure Firebase and deploy!

Good luck! 🎲♟️
