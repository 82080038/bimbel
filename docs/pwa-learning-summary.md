# PWA (Progressive Web App) Learning Summary

## Overview
Progressive Web Apps (PWAs) are web applications that use modern web capabilities to deliver an app-like experience to users. PWAs work offline, are installable, and provide a native-like experience. The Aplikasi Ujian Sekolah Kedinasan is a PWA with service worker support.

## Key PWA Features

### 1. Service Worker
A service worker is a script that runs in the background, separate from the web page, enabling features like offline functionality, push notifications, and background sync.

### 2. Manifest
The web app manifest is a JSON file that provides information about the application, such as name, icons, theme color, and display mode.

### 3. Offline Capability
PWAs can work offline by caching resources using the service worker's Cache API.

### 4. Installability
PWAs can be installed on devices, appearing as native apps.

### 5. Responsive Design
PWAs work on all devices and screen sizes.

## Service Worker Basics

### Registration
```javascript
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
            console.log('Service Worker registered:', registration.scope);
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });
}
```

### Service Worker Lifecycle
```javascript
// service-worker.js

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('v1').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/styles.css',
                '/script.js',
                '/images/logo.png'
            ]);
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== 'v1') {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
```

## Caching Strategies

### 1. Cache First (Cache Fallback to Network)
```javascript
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
```

### 2. Network First (Network Fallback to Cache)
```javascript
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).then(response => {
            // Cache successful responses
            if (response.ok) {
                const responseClone = response.clone();
                caches.open('v1').then(cache => {
                    cache.put(event.request, responseClone);
                });
            }
            return response;
        }).catch(() => {
            return caches.match(event.request);
        })
    );
});
```

### 3. Cache Only
```javascript
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                return response;
            }
            throw new Error('No match in cache');
        })
    );
});
```

### 4. Network Only
```javascript
self.addEventListener('fetch', event => {
    event.respondWith(fetch(event.request));
});
```

### 5. Stale While Revalidate
```javascript
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                caches.open('v1').then(cache => {
                    cache.put(event.request, networkResponse.clone());
                });
                return networkResponse;
            });
            return cachedResponse || fetchPromise;
        })
    );
});
```

## Web App Manifest

### Basic Manifest Structure
```json
{
  "name": "Aplikasi Ujian Sekolah Kedinasan",
  "short_name": "Ujian Kedinasan",
  "description": "Sistem Seleksi Kompetensi Dasar untuk sekolah kedinasan",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1e40af",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml"
    },
    {
      "src": "/icon-512.svg",
      "sizes": "512x512",
      "type": "image/svg+xml"
    }
  ]
}
```

### Manifest Properties

**Basic:**
- `name` - Full app name
- `short_name` - Short name for home screen
- `description` - App description
- `start_url` - URL to open when app launches

**Display:**
- `display` - Display mode: `fullscreen`, `standalone`, `minimal-ui`, `browser`
- `orientation` - Orientation: `any`, `natural`, `landscape`, `portrait`, etc.

**Colors:**
- `background_color` - Background color for splash screen
- `theme_color` - Theme color for UI

**Icons:**
- `icons` - Array of icon objects with src, sizes, type
- `purpose` - Icon purpose: `any`, `maskable`, `monochrome`

**Categories:**
- `categories` - App categories for app stores

**Screenshots:**
- `screenshots` - App screenshots for app stores

## Service Worker Advanced Features

### Background Sync
```javascript
// Register sync
navigator.serviceWorker.ready.then(registration => {
    registration.sync.register('sync-data');
});

// Handle sync in service worker
self.addEventListener('sync', event => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    try {
        const data = await fetchFromCache('pending-data');
        await sendToServer(data);
        await removeFromCache('pending-data');
    } catch (error) {
        console.error('Sync failed:', error);
    }
}
```

### Push Notifications
```javascript
// Subscribe to push
navigator.serviceWorker.ready.then(registration => {
    registration.pushManager.subscribe({
        userVisibleOnly: true
    }).then(subscription => {
        // Send subscription to server
        sendSubscriptionToServer(subscription);
    });
});

// Handle push in service worker
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'New notification',
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Explore',
                icon: '/images/explore.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/images/close.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Push Notification', options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
```

### Periodic Background Sync
```javascript
// Register periodic sync
navigator.serviceWorker.ready.then(registration => {
    registration.periodicSync.register({
        tag: 'sync-articles',
        minInterval: 24 * 60 * 60 * 1000 // 24 hours
    });
});

// Handle periodic sync in service worker
self.addEventListener('periodicsync', event => {
    if (event.tag === 'sync-articles') {
        event.waitUntil(syncArticles());
    }
});
```

## Cache API

### Cache Operations
```javascript
// Open cache
const cache = await caches.open('my-cache');

// Add to cache
await cache.add('/styles.css');
await cache.addAll(['/styles.css', '/script.js']);

// Get from cache
const response = await cache.match('/styles.css');

// Delete from cache
await cache.delete('/styles.css');

// Get all caches
const cacheNames = await caches.keys();

// Delete cache
await caches.delete('my-cache');
```

### Cache Strategies Implementation
```javascript
// Dynamic caching
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open('dynamic-cache').then(cache => {
            return cache.match(event.request).then(response => {
                return response || fetch(event.request).then(networkResponse => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        })
    );
});

// Cache with expiration
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open('dynamic-cache').then(cache => {
            return cache.match(event.request).then(response => {
                if (response && isFresh(response)) {
                    return response;
                }
                return fetch(event.request).then(networkResponse => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        })
    );
});

function isFresh(response) {
    const date = new Date(response.headers.get('date'));
    const now = new Date();
    const maxAge = 3600 * 1000; // 1 hour
    return (now - date) < maxAge;
}
```

## PWA Installation

### Install Prompt
```javascript
let deferredPrompt;

window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    // Show install button
});

// Show install prompt
document.getElementById('install-btn').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
    }
});

// Track installation
window.addEventListener('appinstalled', () => {
    console.log('PWA installed');
});
```

## PWA Best Practices

### 1. Service Worker
- Always handle errors gracefully
- Implement proper caching strategies
- Keep service worker updated
- Use versioning for cache
- Implement cache invalidation

### 2. Manifest
- Provide proper icons in multiple sizes
- Use appropriate display mode
- Set meaningful colors
- Include proper start_url

### 3. Performance
- Cache static assets
- Optimize images
- Minify CSS and JavaScript
- Use lazy loading
- Implement efficient caching strategies

### 4. Offline Experience
- Provide offline fallback page
- Cache essential resources
- Show offline status to users
- Queue actions when offline

### 5. Security
- Use HTTPS
- Validate service worker
- Implement CSP
- Secure push notifications

## PWA in Aplikasi Ujian Sekolah Kedinasan

### Current Implementation:

**Manifest (manifest.json):**
```json
{
  "name": "Aplikasi Ujian Sekolah Kedinasan",
  "short_name": "Ujian Kedinasan",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1e40af",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml"
    },
    {
      "src": "/icon-512.svg",
      "sizes": "512x512",
      "type": "image/svg+xml"
    }
  ]
}
```

**Service Worker (service-worker.js):**
```javascript
const CACHE_NAME = 'ujian-kedinasan-v1';
const urlsToCache = [
    '/',
    '/index.php',
    '/login.html',
    '/participant/dashboard.html',
    '/participant/ujian.html',
    '/participant/materi.html',
    '/participant/profile.html',
    '/admin/admin.html',
    '/icon-192.svg',
    '/icon-512.svg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
```

**Service Worker Registration:**
```javascript
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}
```

### PWA Features Used:
- Offline caching for static resources
- Installable as native app
- Responsive design
- Theme color for UI
- Icons for home screen

### Future Enhancements:
- Background sync for offline actions
- Push notifications for exam reminders
- Offline exam mode
- Caching of exam materials
- Offline results viewing

## Resources

**Official Documentation:**
- [PWA Documentation - web.dev](https://web.dev/progressive-web-apps/)
- [Service Worker API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest - MDN](https://developer.mozilla.org/en-US/docs/Web/Manifest)

**Learning Resources:**
- [PWA Tutorial - web.dev](https://web.dev/learn/pwa/)
- [Workbox - Google](https://developer.chrome.com/docs/workbox/)
- [PWA Builder](https://www.pwabuilder.com/)

**Tools:**
- [Lighthouse - Chrome DevTools](https://developers.google.com/web/tools/lighthouse/)
- [Service Worker Workshop](https://github.com/GoogleChrome/workshop)
- [PWA ROBOT](https://www.pwabuilder.com/robot)
