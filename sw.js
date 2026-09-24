/* ============================================================
   📱 SW.JS — SERVICE WORKER GET CAR MITRA
   Fungsi: simpan aplikasi agar bisa dibuka OFFLINE
   ============================================================ */

// ⚙️ Naikkan versi ini setiap kali kamu update website!
//    Contoh: v1 → v2 → v3 (agar cache lama otomatis terhapus)
const CACHE_NAME = "getcar-v1";

// 📦 File yang disimpan offline saat pertama kali dibuka
const PRECACHE = [
  "./",
  "./index.html",
  "./get.png",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// 🚫 URL yang TIDAK PERNAH di-cache (harus selalu online)
const JANGAN_CACHE = [
  "firebasedatabase",     // Firebase Realtime DB
  "firebasestorage",      // Firebase Storage
  "identitytoolkit",      // Firebase Auth
  "securetoken",          // Firebase Auth token
  ".apk"                  // File APK besar → unduh langsung, jangan di-cache
];

/* ================== 1️⃣ INSTALL ================== */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(PRECACHE.map((url) => cache.add(url)))
      )
      .then(() => self.skipWaiting())
  );
});

/* ================== 2️⃣ ACTIVATE ================== */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ================== 3️⃣ FETCH (inti service worker) ================== */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = req.url;

  if (req.method !== "GET") return;
  if (JANGAN_CACHE.some((k) => url.includes(k))) return;

  // 🌐 Halaman HTML → NETWORK FIRST
  if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const salinan = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, salinan));
          return res;
        })
        .catch(() =>
          caches.match(req).then((r) => r || caches.match("./index.html"))
        )
    );
    return;
  }

  // 🖼️ Aset statis → CACHE FIRST
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res.ok) {
          const salinan = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, salinan));
        }
        return res;
      });
    })
  );
});

/* ================== 4️⃣ PESAN DARI HALAMAN (untuk update) ================== */
self.addEventListener("message", (e) => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});