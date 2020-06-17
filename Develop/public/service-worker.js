const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/style.css",
    "/index.js",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
  ];
  
  const CACHE_NAME = "my-site-cache-v1";
  const DATA_CACHE_NAME = "data-cache-v1";
  
  self.addEventListener("install", function(event) {
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then(function(cache) {
            console.log("opened cache");
            return cache.addAll(urlsToCache);
        } 
    ));
  });
  
  /* // The activate handler takes care of cleaning up old caches.
  self.addEventListener("activate", event => {
    const currentCaches = [STATIC_CACHE, RUNTIME_CACHE];
    event.waitUntil(
      caches
        .keys()
        .then(cacheNames => {
          // return array of cache names that are old to delete
          return cacheNames.filter(
            cacheName => !currentCaches.includes(cacheName)
          );
        })
        .then(cachesToDelete => {
          return Promise.all(
            cachesToDelete.map(cacheToDelete => {
              return caches.delete(cacheToDelete);
            })
          );
        })
        .then(() => self.clients.claim())
    );
  }); */
  
  self.addEventListener("fetch", function(event) {
    // non GET requests are not cached and requests to other origins are not cached
    if (
      event.request.url.includes("/api/")
    ) {
      event.respondWith(caches.open(DATA_CACHE_NAME)
      .then(cache => {
          return fetch(event.request)
          .then(response => {
              if(response.status === 200)
              {
                  cache.put(event.request.url, response.clone());
              }
              return response;
          })
          .catch(err => {
              return cache.match(event.request);
          });  
      })
      .catch(err => console.log(err)));
      return;
    }
  
    // handle runtime GET requests for data from /api routes
    /* if (event.request.url.includes("/api/images")) {
      // make network request and fallback to cache if network request fails (offline)
      event.respondWith(
        caches.open(RUNTIME_CACHE).then(cache => {
          return fetch(event.request)
            .then(response => {
              cache.put(event.request, response.clone());
              return response;
            })
            .catch(() => caches.match(event.request));
        })
      );
      return;
    } */
  
    // use cache first for all other requests for performance
    event.respondWith(
      fetch(event.request).catch(function() {
          return caches.match(event.request)
          .then(function(response) {
              if(response)
              {
                  return response;
              }
              else if(event.request.headers.get("accept").includes("text/html"))
              {
                  return caches.match("/");
              }
          });
        })
    );
});