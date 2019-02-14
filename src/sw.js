self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
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
    let data = {};
    if (event.data) {
        data = event.data.json();
    }

    const title = data.title;
    const message = data.message;
    
    event.waitUntil(self.registration.showNotification(title, {
        body: message
    }));
})
