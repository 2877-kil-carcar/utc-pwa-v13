// sw.js
const CACHE_NAME = "utc-pwa-v11"; // ← バージョンを上げる
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icons/192.png"
];

self.addEventListener("install", (e) => {
  self.skipWaiting(); // ← 新SWを即座にwaitingへ
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // index.htmlは {cache:'reload'} で新鮮な版を入手
      cache.addAll(ASSETS.map(p => p === "./index.html" ? new Request(p, { cache: "reload" }) : p))
    )
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // ← 既存タブも即このSW配下に
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;

  // ① ナビゲーション（HTML）は network-first
  const isHtmlNav = req.mode === "navigate" || req.destination === "document";
  if (isHtmlNav) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // ② それ以外（CSS/JS/画像等）は従来どおり cache-first
  e.respondWith(
    caches.match(req).then((res) => res || fetch(req))
  );
});
