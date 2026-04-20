import { Link } from 'react-router-dom';
import { useState } from 'react';
import SettingsModal from './SettingsModal';

export default function Sidebar() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <div style={styles.sidebar}>
        <div style={styles.topButtons}>
          <Link to="/" style={styles.link}>
            <button style={styles.button}>Home</button>
          </Link>
          <Link to="/ideas" style={styles.link}>
            <button style={styles.button}>Your Ideas for Games</button>
          </Link>
          <Link to="/upload" style={styles.link}>
            <button style={styles.button}>Upload a Game</button>
          </Link>
        </div>
        <div style={styles.bottom}>
          <button onClick={() => setShowSettings(true)} style={styles.settingsButton}>
            Settings
          </button>
        </div>
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}

const styles = {
  sidebar: {
    width: '200px',
    height: '100vh',
    background: '#f8f9fa',
    padding: '20px',
    boxSizing: 'border-box',
    position: 'fixed',
    left: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRight: '1px solid #e9ecef',
  },
  topButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  link: {
    textDecoration: 'none',
  },
  button: {
    width: '100%',
    padding: '12px 16px',
    cursor: 'pointer',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  bottom: {
    marginTop: 'auto',
  },
  settingsButton: {
    width: '100%',
    padding: '10px 16px',
    cursor: 'pointer',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
};