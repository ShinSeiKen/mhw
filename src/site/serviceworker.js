const ASSETS_CACHE = 'assets';
const PAGES_CACHE = 'pages';
const CACHE_WHITELIST = [ ASSETS_CACHE, PAGES_CACHE ];
const OFFLINE_PAGE = '/offline/index.html';
const FILES_TO_CACHE = [
    // '/assets/script/main.js',
    // '/assets/style/style.css',
    // '/assets/img/foo.jpg',
    // '/assets/img/bar.png',
    OFFLINE_PAGE
];

self.addEventListener('install', e => {
    caches.open(ASSETS_CACHE).then(cache => {
        // (1) Cache-first for assets
        cache.addAll(FILES_TO_CACHE);
    })
});
self.addEventListener('fetch', event => {
    // (2) Network first for pages
    if (event.request.headers.get('Accept').includes('text/html')) {
        event.respondWith(
            fetch(event.request)
                .then(response => { return reponse; })
                .catch(error => { return caches.match(event.request); })
        );
    } else {
        event.respondWith(
            caches.match(event.request).then(response => {
                if (response) {
                    return response;
                }

                return fetch(event.request).then(
                    response => {
                        if(! response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        let responseToCache = response.clone();

                        caches.open(PAGES_CACHE).then(cache => cache.put(event.request, responseToCache));

                        return response;
                    }
                );
            })
        );
    }
});

// (3) Clear caches that we do not use anymore.
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(cacheNames.map(function(cacheName) {
                if (CACHE_WHITELIST.indexOf(cacheName) === -1) { return caches.delete(cacheName); }
            }));
        })
    );
});
