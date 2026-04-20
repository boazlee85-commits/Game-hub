import { useEffect, useState } from "react";
import { db, auth, configIsValid } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Ideas() {
  const [ideas, setIdeas] = useState([]);
  const [newIdea, setNewIdea] = useState("");
  const [user, setUser] = useState(null);
  const ideasRef = configIsValid ? collection(db, "ideas") : null;

  // Auth
  useEffect(() => {
    if (!configIsValid) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Real-time ideas
  useEffect(() => {
    if (!configIsValid || !ideasRef) return;
    const q = query(ideasRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIdeas(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });
    return () => unsubscribe();
  }, [ideasRef]);

  if (!configIsValid) {
    return (
      <div style={styles.container}>
        <h1>Game Ideas</h1>
        <p>Please create a <code>.env</code> file with your Firebase credentials.</p>
      </div>
    );
  }


  // Add idea
  async function addIdea() {
    if (!newIdea.trim() || !user) return;
    try {
      await addDoc(ideasRef, {
        text: newIdea,
        author: user.uid,
        likes: [],
        createdAt: Date.now(),
      });
      setNewIdea("");
    } catch (error) {
      console.error("Add idea error:", error);
    }
  }

  // Like idea
  async function likeIdea(ideaId, currentLikes) {
    if (!user) return;
    const ideaDoc = doc(db, "ideas", ideaId);
    const hasLiked = currentLikes.includes(user.uid);
    try {
      if (hasLiked) {
        await updateDoc(ideaDoc, {
          likes: arrayRemove(user.uid),
        });
      } else {
        await updateDoc(ideaDoc, {
          likes: arrayUnion(user.uid),
        });
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  }

  if (!user) {
    return (
      <div style={styles.container}>
        <h1>Game Ideas</h1>
        <p>Please sign in via the Settings button in the sidebar to view and post ideas.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>Game Ideas</h1>

      {/* Add Idea */}
      <div style={styles.addBox}>
        <textarea
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          placeholder="Share your game idea..."
          style={styles.textarea}
        />
        <button onClick={addIdea} style={styles.button}>Post Idea</button>
      </div>

      {/* Ideas List */}
      <div style={styles.ideasList}>
        {ideas.map((idea) => (
          <div key={idea.id} style={styles.ideaCard}>
            <p>{idea.text}</p>
            <div style={styles.likeSection}>
              <button
                onClick={() => likeIdea(idea.id, idea.likes)}
                style={{
                  ...styles.likeButton,
                  background: idea.likes.includes(user.uid) ? "#ff6b6b" : "#4ecdc4",
                }}
              >
                👍 {idea.likes.length}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "sans-serif",
    padding: 20,
    marginLeft: '220px', // Account for sidebar
  },
  addBox: {
    marginBottom: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    alignItems: "center",
  },
  textarea: {
    padding: 10,
    width: 400,
    height: 100,
    resize: "vertical",
  },
  button: {
    padding: '10px 16px',
    cursor: 'pointer',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  ideasList: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  ideaCard: {
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: 8,
    padding: 15,
  },
  likeSection: {
    marginTop: 10,
  },
  likeButton: {
    padding: "8px 12px",
    cursor: "pointer",
    border: "none",
    borderRadius: "6px",
    color: "white",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s",
  },
};