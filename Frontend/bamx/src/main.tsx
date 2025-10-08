import React from "react";
import ReactDOM from "react-dom/client";
import './index.css'
import App from './App.tsx'

//Contexts
import { AuthProvider } from './context/AuthContext';

// Add the event listener here
window.addEventListener('online', () => {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'REPLAY_QUEUE' });
  }
});

// Order of wrapping:
// 1. React.StrictMode (to help identify potential problems)
// 2. AuthProvider (to provide authentication context to the entire app)
// 3. App (the main application component)
// TODO: Admin Context Provider when created

ReactDOM.createRoot(document.getElementById('root')!).render((
  <React.StrictMode>
    <AuthProvider> 
      <App />
    </AuthProvider>
  </React.StrictMode>
))
