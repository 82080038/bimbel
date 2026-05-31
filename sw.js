const CACHE_NAME = 'ujian-kedinasan-v1';
const STATIC_ASSETS = [
    '/bimbel/',
    '/bimbel/index.php',
    '/bimbel/login.html',
    '/bimbel/manifest.json',
    '/bimbel/icon-192.svg',
    '/bimbel/icon-512.svg',
    '/bimbel/js/config.js',
    '/bimbel/js/rbac.js',
    '/bimbel/participant/dashboard.html',
    '/bimbel/participant/ujian.html',
    '/bimbel/participant/materi.html',
    '/bimbel/participant/leaderboard.html',
    '/bimbel/participant/achievements.html',
    '/bimbel/participant/profile.html',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        }).catch(err => {
            console.log('Cache addAll error:', err);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip API requests (don't cache dynamic data)
    if (event.request.url.includes('/api/')) return;
    
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Return cached response and fetch update in background
                fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                }).catch(() => {});
                return cachedResponse;
            }
            
            // Not in cache, fetch from network
            return fetch(event.request).then((networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200) {
                    return networkResponse;
                }
                
                // Clone the response before async cache operation
                const responseClone = networkResponse.clone();
                
                // Cache the cloned response
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                
                return networkResponse;
            }).catch(() => {
                // Network failed, return offline fallback
                if (event.request.mode === 'navigate') {
                    return caches.match('/bimbel/login.html');
                }
                return new Response('Offline', { status: 503 });
            });
        })
    );
});
