// ============================================================
// SERVICE WORKER — Get Car Mitra
// ⚠️ Setiap kali update file (index.html dll), GANTI versi ini:
//    v3 → v4 → v5 (biar HP memuat versi terbaru)
// ============================================================
const CACHE_NAME = "getcar-v3";

// 📦 Daftar file inti yang wajib tersimpan offline
const ASSETS = [
  "./",
  "./index.html",
  "./login.html",
  "./driver.html",
  "./pendaftaran.html",
  "./manifest.json",
  "./awal.png"
];

// 🔧 INSTALL — simpan semua file inti ke cache
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch((err) => {
        console.log("Sebagian file gagal di-cache (wajar jika belum ada):", err);
      });
    })
  );
  self.skipWaiting();
});

// 🔧 ACTIVATE — hapus cache versi lama otomatis
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// 🔧 FETCH — aturan ambil file:
// - Halaman HTML → coba internet dulu (agar update terlihat), gagal → pakai cache
// - Gambar/aset lain → pakai cache dulu (hemat kuota), tidak ada → internet
self.addEventListener("fetch", (e) => {
  const req = e.request;

  // Abaikan selain GET
  if (req.method !== "GET") return;

  // Abaikan request ke luar (Firebase, Google Fonts, Unsplash, dll)
  if (!req.url.startsWith(self.location.origin)) return;

  // Halaman HTML → network first
  if (req.headers.get("accept") && req.headers.get("accept").includes("text/html")) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Aset lain → cache first
  e.respondWith(
    caches.match(req).then((res) => res || fetch(req))
  );
});
