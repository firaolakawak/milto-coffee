import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import { TabsProvider } from '@/lib/TabsContext'
import '@/index.css'

// Apply dark mode based on system preference
const applyDarkMode = () => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
applyDarkMode();
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyDarkMode);

// Register PWA Service Worker (production only)
if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    // In dev, aggressively unregister all service workers and clear all caches
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(r => r.unregister());
    });
    caches.keys().then(keys => {
      keys.forEach(key => caches.delete(key));
    });
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TabsProvider>
      <App />
    </TabsProvider>
  </React.StrictMode>
)