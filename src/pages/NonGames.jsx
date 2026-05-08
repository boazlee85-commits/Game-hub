import { useEffect, useState } from "react";

export default function NonGames() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("items") || "[]");
    setItems(stored.filter(i => i.type === "non-game"));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Non‑Games</h1>

      {items.length === 0 && (
        <p className="text-muted-foreground">No non‑games uploaded yet.</p>
      )}

      <div className="grid gap-4">
        {items.map(item => (
          <div key={item.id} className="p-4 border rounded-lg bg-card">
            <a
              href={item.url}
              target="_blank"
              className="text-primary underline text-lg"
            >
              {item.title}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
