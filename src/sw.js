importScripts('https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.js');

const CACHE = 'v3';

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
                '/assets/144x144.png',
                '/assets/notify.mp3'
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    // bypass upload request
    if (event.request.method != 'GET') {
        return;
    }
    
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
    const pushTitle = 'Aiursoft Push System';
    const fileLink = 'https://oss.cdn.aiursoft.com/download/fromkey/';
    const imageLink = fileLink + '4251';
    if (data.type == 0 && !data.muted) {
        // new message
        const title = (data.mentioned ? '[Mentioned you] ' : '') + data.sender.nickName;
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
                    if (!isNaN(URLId) && URLId == data.conversationId && talkingPage) {
                        showNotification = false;
                    }
                });
    
                if (showNotification) {
                    return self.registration.showNotification(title, {
                        body: message,
                        icon: fileLink + data.sender.headImgFileKey,
                        renotify: true,
                        tag: data.conversationId.toString()
                    });
                }
            })
        );
    } else if (data.type == 1) {
        // new friend request
        self.registration.showNotification(pushTitle, {
            body: 'You have got a new friend request!',
            icon: imageLink,
            renotify: true,
            tag: -1
        });
    } else if (data.type == 2) {
        // were deleted event
        self.registration.showNotification(pushTitle, {
            body: 'You were deleted by one of your friends from his friend list.',
            icon: imageLink,
            renotify: true,
            tag: -1
        });
    } else if (data.type == 3) {
        // friend accepted event
        self.registration.showNotification(pushTitle, {
            body: 'Your friend request was accepted!',
            icon: imageLink,
            renotify: true,
            tag: -1
        });
    }
});
