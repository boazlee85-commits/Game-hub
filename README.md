# Game Hub

A React-based game sharing platform built with Vite, Firebase, and React Router.

## Features

- **Game Library**: Browse and play games in a grid layout
- **Game Ideas**: Share and like game ideas (requires authentication)
- **Admin Upload**: Upload new games (admin only)
- **Authentication**: Sign in/sign up with email and password
- **Real-time Updates**: Live updates using Firebase Firestore

## Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd game-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication with Email/Password
   - Enable Firestore Database
   - Copy your Firebase config

4. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

## Admin Access

To upload games, sign in with the admin account configured in the code.

## Build for Production

```bash
npm run build
```

## Tech Stack

- React 19
- Vite
- Firebase (Auth + Firestore)
- React Router
- ESLint
