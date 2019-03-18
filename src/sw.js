importScripts('https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.js');

const CACHE = 'v2';

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE).then(function(cache) {
            return cache.addAll([
                '/index.html',
                '/main.js',
                '/manifest.json',
                '/polyfills.js',
                '/runtime.js',
                '/styles.js',
                '/vendor.js',
                '/favicon.ico',
                '/fontawesome-webfont.woff2',
                '/assets/144x144.png'
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );

    event.waitUntil(
        caches.match(event.request).then(function(response) {
            if (response) {
                caches.open(CACHE).then(function(cache) {
                    fetch(event.request).then(function(resp) {
                        cache.put(event.request, resp);
                    });
                });
            }
        })
    );
});

self.addEventListener('activate', function(event) {
    const cacheKeeplist = [CACHE];
    event.waitUntil(
        self.clients.claim(),
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (cacheKeeplist.indexOf(key) === -1) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

self.addEventListener('notificationclick', function(event) {
    event.waitUntil(
        self.clients.matchAll().then(function(clientList) {
            if (clientList.length > 0) {
                return clientList[0].focus();
            } else {
                return self.clients.openWindow('/');
            }
        })
    );
    event.notification.close();
});

self.addEventListener('push', function(event) {
    if (!event.data) {
        return;
    }
    let data = event.data.json();
    if (data.type == 0 && !data.muted) {
        const title = data.sender.nickName;
        let message = data.content;
        const aesKey = data.aesKey;
        
        message = CryptoJS.AES.decrypt(message, aesKey).toString(CryptoJS.enc.Utf8);
        if (message.startsWith('[img]')) {
            message = 'Photo';
        } else if (message.startsWith('[video]')) {
            message = 'Video';
        } else if (message.startsWith('[file]')) {
            message = 'File';
        } else if (message.startsWith('[audio]')) {
            message = 'Audio';
        }

        let showNotification = true;
        event.waitUntil(
            self.clients.matchAll().then(function(clientList) {
                clientList.forEach(function(client) {
                    const URLArray = client.url.split('/');
                    let URLId = -1;
                    let talkingPage = false;
                    if (URLArray.length > 4) {
                        URLId = parseInt(URLArray[4]);
                        if (URLArray[3] == 'talking') {
                            talkingPage = true;
                        }
                    }
                    if (!isNaN(URLId) && URLId == data.conversationId && client.focused && talkingPage) {
                        showNotification = false;
                    }
                });
    
                if (!data.sentByMe && showNotification) {
                    return self.registration.showNotification(title, {
                        body: message,
                        icon: 'https://oss.aiursoft.com/download/fromkey/' + data.sender.headImgFileKey,
                        renotify: true,
                        tag: data.conversationId.toString()
                    });
                }
            })
        );
    }
});
