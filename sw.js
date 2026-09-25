// ============================================
// SERVICE WORKER — Get Car Mitra
// ⚠️ PENTING: Naikkan versi cache (v2 → v3 → v4...)
// SETIAP KALI Anda memperbarui file aplikasi,
// agar driver mendapat versi terbaru!
// ============================================
const CACHE_NAME = "getcar-v2";

const ASSETS = [
  "index.html",
  "login.html",
  "pendaftaran.html",
  "gc.png",
  "get.png",
  "logoGC.png",
  "splash-logo.png",
  "manifest.json"
];

// INSTALL — simpan file inti ke cache
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // .catch() mencegah gagal total jika ada 1 file belum diupload
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

// FETCH — strategi Cache First (hanya untuk file milik aplikasi)
self.addEventListener("fetch", (e) => {
  // Hanya tangani request GET
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);

  // Request lintas domain (Firebase, font Google, Unsplash, dll)
  // diteruskan langsung ke internet — TIDAK di-cache
  // agar data orderan/login selalu fresh
  if (url.origin !== location.origin) return;

  // File milik aplikasi: cek cache dulu, tidak ada → ambil internet
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
