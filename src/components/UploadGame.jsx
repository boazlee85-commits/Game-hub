import { useEffect, useState } from "react";
import { db, auth, configIsValid } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function UploadGame() {
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState([]);
  const gamesRef = configIsValid ? collection(db, "games") : null;

  // Auth
  useEffect(() => {
    if (!configIsValid) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Real-time games
  useEffect(() => {
    if (!configIsValid || !gamesRef) return;
    const q = query(gamesRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGames(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });
    return () => unsubscribe();
  }, [gamesRef]);

  if (!configIsValid) {
    return (
      <div style={styles.container}>
        <h1>Upload a Game</h1>
        <p>Please create a <code>.env</code> file with your Firebase credentials.</p>
      </div>
    );
  }

  // Add game
  async function addGame() {
    if (!url.trim()) return;
    setLoading(true);
    try {
      await addDoc(gamesRef, {
        url,
        image: image || "",
        createdAt: Date.now(),
      });
      setUrl("");
      setImage("");
      alert("Game added successfully!");
    } catch (error) {
      console.error("ADD ERROR:", error);
      alert("Error adding game: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Check if user is the admin
  const isAdmin = user && user.email === "boazlee85@gmail.com";

  if (!user) {
    return (
      <div style={styles.container}>
        <h1>Upload a Game</h1>
        <p>Please sign in to access this page.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={styles.container}>
        <h1>Access Denied</h1>
        <p>You do not have permission to upload games.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>Upload a Game</h1>

      {/* ADD GAME */}
      <div style={styles.addBox}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Game link..."
          style={styles.input}
        />

        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Image URL (optional)"
          style={styles.input}
        />

        <button onClick={addGame} disabled={loading} style={styles.button}>
          {loading ? "Adding..." : "Add Game"}
        </button>
      </div>

      {/* GAMES LIST */}
      <div style={styles.gamesList}>
        <h2>All Games</h2>
        {games.map((game) => (
          <div key={game.id} style={styles.gameItem}>
            <a href={game.url} target="_blank" rel="noopener noreferrer" style={styles.link}>
              {game.url}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

// 🎨 STYLES
const styles = {
  container: {
    fontFamily: "sans-serif",
    padding: 20,
    marginLeft: '220px', // To account for sidebar
    textAlign: "center",
  },

  addBox: {
    marginBottom: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    alignItems: "center",
    maxWidth: 400,
    margin: "0 auto",
  },

  input: {
    padding: 10,
    width: 300,
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
  },

  button: {
    padding: "10px 16px",
    cursor: "pointer",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s",
  },

  gamesList: {
    textAlign: "left",
    maxWidth: 600,
    margin: "0 auto",
  },

  gameItem: {
    marginBottom: 10,
    padding: 10,
    border: "1px solid #ddd",
    borderRadius: "6px",
    background: "#f9f9f9",
  },

  link: {
    color: "#007bff",
    textDecoration: "none",
    fontSize: "16px",
  },
};