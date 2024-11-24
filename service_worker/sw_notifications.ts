const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('notificationclick', function (event) {
    const data = event.notification.data;
    event.waitUntil(
        sw.clients.matchAll().then(function (clientList) {
            const wClientList = clientList.filter(t => t.type === 'window') as WindowClient[];
            if (wClientList.length > 0) {
                return wClientList[0].focus();
            } else {
                if (data && data.type === 0 && data.message.conversationID !== -1) {
                    return sw.clients.openWindow(`/talking/${data.message.conversationId}`);
                } else {
                    return sw.clients.openWindow('/');
                }
            }
        })
    );
    event.notification.close();
});

sw.addEventListener('push', function (event) {
    if (!event.data) {
        return;
    }
    const data = event.data.json();
    const imageLink = `https://probe.aiursoft.com/Download/Open/${encodeURIComponent(data.message.sender.iconFilePath).replace(/%2F/g, '/')}`;

    if (data.type == 0 && !data.muted) {
        // new message
        const title = (data.mentioned ? '[Mentioned you] ' : '') + data.message.sender.nickName;
        let message = data.message.content;

        if (message.startsWith('[img]')) {
            message = 'Photo';
        } else if (message.startsWith('[video]')) {
            message = 'Video';
        } else if (message.startsWith('[file]')) {
            message = 'File';
        } else if (message.startsWith('[audio]')) {
            message = 'Audio';
        } else if (message.startsWith('[group]')) {
            message = 'Group Invitation';
        } else if (message.startsWith('[user]')) {
            message = 'Contact card';
        }

        let showNotification = true;
        event.waitUntil(
            sw.clients.matchAll().then(function (clientList) {
                clientList.forEach(function (client) {
                    if (client.type !== 'window') return;
                    const windowClient = client as WindowClient;
                    const URLArray = windowClient.url.split('/');
                    let URLId = -1;
                    let talkingPage = false;
                    if (URLArray.length > 4) {
                        URLId = parseInt(URLArray[4]);
                        if (URLArray[3] == 'talking') {
                            talkingPage = true;
                        }
                    }
                    if (
                        !isNaN(URLId) &&
                        URLId == data.message.conversationId &&
                        windowClient.focused &&
                        talkingPage
                    ) {
                        showNotification = false;
                    }
                });

                if (showNotification) {
                    return sw.registration.showNotification(title, {
                        body: message,
                        icon: imageLink,
                        tag: data.threadId.toString(),
                        data: data,
                    });
                }
            })
        );
    }
});