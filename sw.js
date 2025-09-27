// sw.js
const CACHE_NAME = "utc-pwa-v11"; // �� �o�[�W�������グ��
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icons/192.png"
];

self.addEventListener("install", (e) => {
  self.skipWaiting(); // �� �VSW�𑦍���waiting��
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // index.html�� {cache:'reload'} �ŐV�N�Ȕł����
      cache.addAll(ASSETS.map(p => p === "./index.html" ? new Request(p, { cache: "reload" }) : p))
    )
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // �� �����^�u��������SW�z����
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;

  // �@ �i�r�Q�[�V�����iHTML�j�� network-first
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

  // �A ����ȊO�iCSS/JS/�摜���j�͏]���ǂ��� cache-first
  e.respondWith(
    caches.match(req).then((res) => res || fetch(req))
  );
});
