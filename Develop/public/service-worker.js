const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/styles.css",
    "/index.js",
    "/db.js",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
  ];
  
  const CACHE_NAME = "my-site-cache-v1";
  const DATA_CACHE_NAME = "data-cache-v1";
  
  self.addEventListener("install", function(event) {
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then(function(cache) {
            console.log("opened cache");
            return cache.addAll(FILES_TO_CACHE);
        }
    ));
  });
  
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