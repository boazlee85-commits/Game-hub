import { Routes, Route, Link } from "react-router-dom";
import Home from "@/pages/Home";
import Upload from "@/pages/Upload";
import Ideas from "@/pages/Ideas";
import Settings from "@/pages/Settings";
import NonGames from "@/pages/NonGames";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="p-4 border-b flex gap-4 bg-background">
        <Link to="/">Home</Link>
        <Link to="/upload">Upload</Link>
        <Link to="/ideas">Ideas</Link>
        <Link to="/settings">Settings</Link>
        <Link to="/non-games">Non‑Games</Link> {/* NEW LINK */}
      </nav>

      <main className="flex-1 p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/non-games" element={<NonGames />} /> {/* NEW PAGE */}
        </Routes>
      </main>
    </div>
  );
}
