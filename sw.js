// ============================================
// SERVICE WORKER — Get Car Mitra
// ⚠️ Naikkan versi (v2 → v3 → v4...) SETIAP KALI
// memperbarui file aplikasi, agar driver
// mendapat versi terbaru!
// ============================================
const CACHE_NAME = "getcar-v2";

const ASSETS = [
  "index.html",
  "login.html",
  "pendaftaran.html",
  "gc.png",
  "get.png",
  "logoGC.png",
  "awal.png",
  "manifest.json"
];

// INSTALL — simpan file inti ke cache
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(ASSETS.map((url) => cache.add(url).catch(() => {})))
    )
  );
  self.skipWaiting();
});

// ACTIVATE — hapus cache versi lama
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// FETCH — Cache First untuk file milik aplikasi saja
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);

  // Request lintas domain (Firebase, font, Unsplash) → internet langsung
  // agar data login/order selalu fresh, tidak ke-cache
  if (url.origin !== location.origin) return;

  // File aplikasi → cache dulu, tidak ada → internet
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
