import { useEffect, useState } from "react";
import { db, configIsValid } from "../firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

export default function Home() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState("");
  const gamesRef = configIsValid ? collection(db, "games") : null;

  // 🔥 REAL-TIME FIREBASE
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
        <h1>Game Hub</h1>
        <p>Please create a <code>.env</code> file with your Firebase credentials.</p>
      </div>
    );
  }


  // 🔍 SEARCH FILTER
  const filteredGames = games.filter((game) =>
    game.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <h1>Game Hub</h1>

      {/* SEARCH */}
      <input
        placeholder="Search games..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

      {/* GRID */}
      <div style={styles.grid}>
        {filteredGames.map((game) => (
          <div key={game.id} style={styles.card}>
            
            {/* IMAGE */}
            {game.image ? (
              <img src={game.image} alt="game" style={styles.img} />
            ) : (
              <div style={styles.placeholder}>No Image</div>
            )}

            {/* PLAY BUTTON */}
            <a
              href={game.url}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.playBtn}
            >
              ▶ Play
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
    textAlign: "center",
    marginLeft: '220px', // To account for sidebar
  },

  search: {
    padding: 10,
    width: 300,
    marginBottom: 20,
  },

  // 3 columns
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 15,
    maxWidth: 900,
    margin: "0 auto",
  },

  // 🔥 SQUARE CARD
  card: {
    aspectRatio: "1 / 1",
    background: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #ccc",
    display: "flex",
    flexDirection: "column",
  },

  img: {
    width: "100%",
    height: "75%",
    objectFit: "cover",
  },

  placeholder: {
    width: "100%",
    height: "75%",
    background: "#ddd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  playBtn: {
    height: "25%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "green",
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
  },
};