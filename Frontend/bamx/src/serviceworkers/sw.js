// Use IndexedDB for persistent queue storage
import {precacheAndRoute} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { createHandlerBoundToURL } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);
const DB_NAME = 'bamx-pwa-db';
const STORE_NAME = 'post-queue';

registerRoute(
  new NavigationRoute(
    createHandlerBoundToURL('/index.html')
  )
);

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, { autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}


function queuePostRequest(request) {
  console.log('Queuing request:', request);
  return openDB().then(db => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add(request);
    tx.oncomplete = () => console.log('Request queued in IndexedDB');
    tx.onerror = (e) => console.error('IndexedDB error:', e);
    return tx.complete;
  });
}
function replayQueuedRequests() {
  return openDB().then(db => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getAll = store.getAll();
    getAll.onsuccess = async () => {
      for (const req of getAll.result) {
        try {
          await fetch(req.url, {
            method: req.options.method,
            headers: req.options.headers,
            body: req.options.body,
            credentials: 'include', // ensure cookies (HttpOnly refresh) are sent
          });
        } catch (e) {
          // If still offline, keep in queue
          console.error('Replay failed, still offline?', e);
          return;
        }
      }
       // Use a new transaction to clear the store
      const clearTx = db.transaction(STORE_NAME, 'readwrite');
      clearTx.objectStore(STORE_NAME).clear();
    };
  });
}

function headersToObject(headers) {
  const obj = {};
  for (const [key, val] of headers.entries()) obj[key] = val;
  return obj;
}

self.addEventListener('wake', event => {
  console.log('Service Worker woke up:', event);
});

// Install event
self.addEventListener('install', event => {
  self.skipWaiting();
  console.log('Service Worker installed');
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
  console.log('Service Worker activated');
});

// Intercept fetch events
self.addEventListener('fetch', event => {
  const { request } = event;
  console.log('SW intercept:', request.method, request.url);
  if (
    request.method === 'POST' &&
    request.url.includes('/api/')
  ) {
    console.log('Intercepted POST to /api');
    event.respondWith(
      fetch(request.clone(), {credentials: 'include'}) //Include cookies when online
        .catch(() => {
          request.clone().json().then(body => {
            console.log('Queuing POST body:', body);
            queuePostRequest({
              url: request.url,
              options: {
                method: 'POST',
                headers: headersToObject(request.headers),
                body: JSON.stringify(body)
              }
            });
          });
          return new Response(
            JSON.stringify({ offline: true, queued: true }),
            { status: 202, headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
  }
});

// Replay queued requests when back online
self.addEventListener('sync', event => {
  console.log('Sync event:', event);
  if (event.tag === 'replay-post-queue') {
    console.log('Replaying queued POST requests');
    event.waitUntil(replayQueuedRequests());
  }
});

// Listen for messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'REPLAY_QUEUE') {
    console.log('Received REPLAY_QUEUE message');
    replayQueuedRequests();
  }
});