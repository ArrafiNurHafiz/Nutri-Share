const CACHE_NAME = "nutrishare-v7";
const STATIC_CACHE = "nutrishare-static-v7";
const API_CACHE = "nutrishare-api-v7";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== API_CACHE)
          .map((name) => caches.delete(name)),
      );
    }),
  );
  self.clients.claim();
});

// Listen for messages from clients (e.g. skipWaiting on update)
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data?.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((name) => caches.delete(name)));
      }),
    );
  }
});

// Fetch event handler
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // 1. Live streaming / Server-Sent Events (SSE) - NEVER intercept or cache
  // SSE connections must pass through to browser native fetch directly
  if (
    url.pathname.startsWith("/api/events") ||
    url.pathname.endsWith("/stream") ||
    request.headers.get("accept")?.includes("text/event-stream")
  ) {
    return;
  }

  // 2. Navigation requests (HTML pages) - Network-first, fallback to cache for offline
  // This ensures new deployments are immediately received without stale chunk errors
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseToCache).catch(() => {});
              cache.put("/index.html", responseToCache.clone()).catch(() => {});
            }).catch(() => {});
          }
          return response;
        })
        .catch(() => {
          return caches.match("/index.html").then((cached) => {
            return cached || caches.match("/");
          });
        }),
    );
    return;
  }

  // 3. API requests - Network first with selective cache fallback for non-auth GET requests
  if (url.pathname.startsWith("/api/")) {
    // Never cache dynamic authentication endpoints
    if (url.pathname.startsWith("/api/auth/")) {
      return;
    }

    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache standard 200 OK responses
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseToCache).catch(() => {});
            }).catch(() => {});
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        }),
    );
    return;
  }

  // 4. Static assets (JS, CSS, images, fonts) - Cache first, network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version and update in background if online
        fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, response).catch(() => {});
              }).catch(() => {});
            }
          })
          .catch(() => {
            /* ignore network errors */
          });
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseToCache).catch(() => {});
            }).catch(() => {});
          }
          return response;
        })
        .catch(() => {
          return new Response("Offline", { status: 503 });
        });
    }),
  );
});

// Background sync for offline donations
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-donations") {
    event.waitUntil(syncDonations());
  }
});

async function syncDonations() {
  // Get pending donations from IndexedDB and sync
  // This would be implemented with a library like idb
  console.log("Syncing donations...");
}

// Push notification handler
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.message || "Anda memiliki notifikasi baru",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.action_url || "/",
    },
    actions: [
      {
        action: "open",
        title: "Buka",
        icon: "/icons/icon-192.png",
      },
      {
        action: "close",
        title: "Tutup",
        icon: "/icons/icon-192.png",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "NutriShare", options),
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || "/");
      }
    }),
  );
});
