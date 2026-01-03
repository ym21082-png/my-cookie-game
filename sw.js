// バージョン名（ここを v1, v2... と変えることで更新を反映させます）
const CACHE_NAME = "cookie-clicker-v15";

// キャッシュするファイルのリスト
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./cookie.png",
  "./click.mp3",
  "./manifest.json"
];

// 1. インストール時：ファイルをキャッシュ（保存）する
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log("ファイルを保存しました");
      return cache.addAll(urlsToCache);
    })
  );
});

// 2. 起動時：古いキャッシュを削除する（バージョンアップ用）
self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log("古いキャッシュを削除しました:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 3. 通信時：キャッシュがあればそれを使う（オフライン対応）
self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // キャッシュにあればそれを返す、なければネットに取りに行く
      return response || fetch(event.request);
    })
  );
});
