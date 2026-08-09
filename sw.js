/* Service Worker — network-first عشان أي تحديث يظهر فوراً، ومع كده يشتغل بدون إنترنت */
const CACHE = "super-run-v8";
const ASSETS = [
  "./",
  "./index.html",
  "./game.js",
  "./manifest.json",
  "./icon.svg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting(); // فعّل النسخة الجديدة فوراً
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// استراتيجية: جرّب الشبكة الأول، وحدّث الكاش، ولو مفيش نت استخدم المخزّن
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((c) => c || caches.match("./index.html")))
  );
});
