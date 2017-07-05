importScripts('workbox-sw.prod.v1.0.1.js');

/**
 * DO NOT EDIT THE FILE MANIFEST ENTRY
 *
 * The method precache() does the following:
 * 1. Cache URLs in the manifest to a local cache.
 * 2. When a network request is made for any of these URLs the response
 *    will ALWAYS comes from the cache, NEVER the network.
 * 3. When the service worker changes ONLY assets with a revision change are
 *    updated, old cache entries are left as is.
 *
 * By changing the file manifest manually, your users may end up not receiving
 * new versions of files because the revision hasn't changed.
 *
 * Please use workbox-build or some other tool / approach to generate the file
 * manifest which accounts for changes to local files and update the revision
 * accordingly.
 */
const fileManifest = [
  {
    "url": "/android-chrome-192x192.png",
    "revision": "6046ee2ef95e611648528389f572d27f"
  },
  {
    "url": "/android-chrome-512x512.png",
    "revision": "4495475f3fa1e25294ed0cf6512b2315"
  },
  {
    "url": "/apple-touch-icon.png",
    "revision": "cc350c68cf18e24e2bb4924e99633e1f"
  },
  {
    "url": "/browserconfig.xml",
    "revision": "7f2b2f8a4c6863cc7be0a1e4b7963bd9"
  },
  {
    "url": "/css/bundle-4ae540c136.css",
    "revision": "4ae540c1360709b91319c841bea59d81"
  },
  {
    "url": "/errors/403.html",
    "revision": "312f6c09d91a678b6de96f5e88c3080f"
  },
  {
    "url": "/errors/404.html",
    "revision": "b6f506350d2b4907f0bdf1b6874182d6"
  },
  {
    "url": "/favicon-16x16.png",
    "revision": "00b7868a7e4baf56d2e66a6355698b33"
  },
  {
    "url": "/favicon-32x32.png",
    "revision": "3658e853f3f283328b9ef41c422b3e28"
  },
  {
    "url": "/favicon.ico",
    "revision": "6ce7e0f5813b7856284d7210cd3a24dc"
  },
  {
    "url": "/google8a2b06a9867fca33.html",
    "revision": "b5de9a2130f8021f327e8f2ebd103977"
  },
  {
    "url": "/humans.txt",
    "revision": "d836a41d0d460f843da749dda2d153d7"
  },
  {
    "url": "/img/logo-circle-pink-6567584d0f.png",
    "revision": "6567584d0f159fe9bef6d769ce8ce38f"
  },
  {
    "url": "/img/logo-liit-3ba10d58d5.png",
    "revision": "3ba10d58d54bec81f9416c443aedf156"
  },
  {
    "url": "/img/logo-random-pink-3ba10d58d5.png",
    "revision": "3ba10d58d54bec81f9416c443aedf156"
  },
  {
    "url": "/img/logo-randon-white-da0a5e497a.png",
    "revision": "da0a5e497a011262b942239841bccb2a"
  },
  {
    "url": "/img/social-networks/google-banner-3324182b77.png",
    "revision": "3324182b77c72f437d0b264c764b81e7"
  },
  {
    "url": "/img/social-networks/twitter-banner-361255ac33.png",
    "revision": "361255ac33297dd50b4f3d4ca72eca06"
  },
  {
    "url": "/img/social-networks/twitter-card-c2cad66f71.png",
    "revision": "c2cad66f715e81b224f54afba30a7972"
  },
  {
    "url": "/img/social-networks/twitter-large-card-0d72293ea1.png",
    "revision": "0d72293ea1b677599ef0e6d7d5668b6a"
  },
  {
    "url": "/index.html",
    "revision": "741f6b5ae842290f49f81071883f22e6"
  },
  {
    "url": "/js/common-accd45414f.js",
    "revision": "accd45414fcd6ec28bda74c33f51c8b5"
  },
  {
    "url": "/js/index-deea73e683.js",
    "revision": "deea73e683ce5f00e5fce6bf02c4143d"
  },
  {
    "url": "/js/portfolio-d08188333e.js",
    "revision": "d08188333e3c4893ee4274c3e139241b"
  },
  {
    "url": "/manifest.json",
    "revision": "a1524425a8eddd87a159530e973c9403"
  },
  {
    "url": "/mstile-150x150.png",
    "revision": "23a16b661e3b69fe31c340d226785e37"
  },
  {
    "url": "/portfolio.html",
    "revision": "3048208527f304529c1a5ab7c979813f"
  },
  {
    "url": "/robots.txt",
    "revision": "1049cec5c2188e97df77224079b1fea8"
  },
  {
    "url": "/safari-pinned-tab.svg",
    "revision": "8ed7bfb3f09e94b6735718d4ce1a56c8"
  },
  {
    "url": "/sitemap.xml",
    "revision": "22228f16dc0ffbca2ee83e94449b4443"
  }
];

const workboxSW = new self.WorkboxSW({
  "skipWaiting": true,
  "clientsClaim": true
});
workboxSW.precache(fileManifest);
