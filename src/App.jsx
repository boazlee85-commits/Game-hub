import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Ideas from './components/Ideas';
import UploadGame from './components/UploadGame';

export default function App() {
  return (
    <Router>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ideas" element={<Ideas />} />
        <Route path="/upload" element={<UploadGame />} />
      </Routes>
    </Router>
  );
}
