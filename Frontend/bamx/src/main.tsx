import React from "react";
import ReactDOM from "react-dom/client";
import './index.css'
import App from './App.tsx'

// Add the event listener here
window.addEventListener('online', () => {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'REPLAY_QUEUE' });
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render((
  <React.StrictMode>
    <App />
  </React.StrictMode>
))
