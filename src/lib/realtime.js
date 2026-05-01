const CHANNEL_NAME = 'gamehub_realtime_channel';
const STORAGE_KEY = 'gamehub_realtime_message';
const sourceId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
let initialized = false;
let ws = null;
let broadcastChannel = null;
const listeners = {
  game_added: [],
};

const getWsUrl = () => import.meta.env.VITE_WS_URL || null;

const dispatch = (message) => {
  if (!message || message.sourceId === sourceId) return;
  if (message.type === 'game_added') {
    listeners.game_added.forEach((listener) => listener(message.payload));
  }
};

const handleIncoming = (message) => {
  try {
    if (typeof message === 'string') {
      message = JSON.parse(message);
    }
  } catch (error) {
    return;
  }

  dispatch(message);
};

const connectWebSocket = () => {
  const url = getWsUrl();
  if (!url || typeof window === 'undefined') return;

  try {
    ws = new WebSocket(url);
    ws.addEventListener('open', () => {
      console.debug('[realtime] connected to', url);
    });
    ws.addEventListener('message', (event) => {
      handleIncoming(event.data);
    });
    ws.addEventListener('close', () => {
      ws = null;
      setTimeout(connectWebSocket, 2000);
    });
    ws.addEventListener('error', () => {
      ws?.close();
    });
  } catch (error) {
    console.error('[realtime] websocket error', error);
  }
};

const initRealtime = () => {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  if (typeof BroadcastChannel !== 'undefined') {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    broadcastChannel.addEventListener('message', (event) => {
      handleIncoming(event.data);
    });
  }

  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    handleIncoming(event.newValue);
  });

  connectWebSocket();
};

const sendMessage = (message) => {
  const payload = {
    ...message,
    sourceId,
    createdAt: Date.now(),
  };

  const text = JSON.stringify(payload);

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(text);
  }

  if (broadcastChannel) {
    broadcastChannel.postMessage(payload);
  }

  try {
    localStorage.setItem(STORAGE_KEY, text);
  } catch (error) {
    console.error('[realtime] failed to write localStorage message', error);
  }
};

const onGameAdded = (callback) => {
  listeners.game_added.push(callback);
  return () => {
    const index = listeners.game_added.indexOf(callback);
    if (index !== -1) listeners.game_added.splice(index, 1);
  };
};

const broadcastGame = (game) => {
  if (!game || !game.id) return;
  sendMessage({ type: 'game_added', payload: game });
};

export const realtime = {
  initRealtime,
  onGameAdded,
  broadcastGame,
};
