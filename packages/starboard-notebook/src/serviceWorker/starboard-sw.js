self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (ev) => {
  if (ev.data?.type === "removeCrossOriginIsolatedServiceWorker") {
    self.registration
      .unregister()
      .then(function () {
        return self.clients.matchAll();
      })
      .then(function (clients) {
        clients.forEach((client) => client.navigate(client.url));
      });
  }
});

self.addEventListener("fetch", function (event) {
  if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        if (response.status === 0) {
          return response;
        }

        // It seems like we only need to set the headers for index.html
        // If you want to be on the safe side, comment this out
        //if (!response.url.includes("index.html")) return response;

        const newHeaders = new Headers(response.headers);
        // newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
        // newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");

        const moddedResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });

        return moddedResponse;
      })
      .catch(function (e) {
        console.error(e);
      })
  );
});
