import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import PageNotFound from './lib/PageNotFound';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Play from './pages/Play';
import Rules from './pages/Rules';
import Settings from './pages/Settings';
import Pieces from './pages/Pieces';
import Lobby from './pages/Lobby';
import OnlineGame from './pages/OnlineGame';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<Play />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/pieces" element={<Pieces />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/game/:id" element={<OnlineGame />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
