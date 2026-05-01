# Game Hub

A local game sharing and idea collection website built with React and Vite.

**About**

This is a standalone web application for sharing and discovering games. Users can upload games, browse the collection, and share ideas for new games.

**Features**

- Browse and search uploaded games
- Upload new games (password protected)
- Share and vote on game ideas
- Local storage (no backend required)
- Responsive design with dark/light themes

**Getting Started**

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Run the development server: `npm run dev`

**Usage**

- **Home**: Browse and search games
- **Upload Games**: Add new games (requires password)
- **Ideas**: Share and vote on game ideas
- **Settings**: Change upload password

**Default Upload Password**

The default password for uploading games is `0424`. You can change it in Settings.

**Build for Production**

```bash
npm run build
npm run preview
```

**Firebase Hosting**

1. Install Firebase CLI if needed: `npm install -g firebase-tools` or use `npx firebase`.
2. Log in to Firebase: `firebase login`.
3. Deploy the app:

```bash
npm run deploy
```

The project is already configured for Firebase Hosting and Firestore with the app settings provided.

**Tech Stack**

- React 18
- Vite
- Tailwind CSS
- Radix UI
- React Query
- Framer Motion