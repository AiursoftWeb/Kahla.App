const sw = self as unknown as ServiceWorkerGlobalScope;

async function getWindowClients() {
    const clients = (await sw.clients.matchAll()).filter(
        t => t.type === 'window'
    ) as WindowClient[];

    return clients;
}

sw.addEventListener('notificationclick', event =>
    event.waitUntil(
        (async () => {
            const data = event.notification.data;
            const clients = await getWindowClients();
            if (clients.length) {
                clients[0].focus();
                clients[0].postMessage({
                    type: 'navigate',
                    threadId: data.preferredUrl,
                });
            } else {
                await sw.clients.openWindow(data.preferredUrl);
            }
            event.notification.close();
        })()
    )
);

sw.addEventListener('push', event =>
    event.waitUntil(
        (async () => {
            const data = event.data.json();
            if (data.type === 0) {
                // new message
                const title =
                    (data.mentioned ? '[Mentioned you] ' : '') + data.message.sender.nickName;
                const message = data.message.preview;

                const bypassNotification = (await getWindowClients())
                    .filter(t => t.focused)
                    .some(t => t.url === `/talking/${data.message.threadId}`);

                if (bypassNotification) return;
                await sw.registration.showNotification(title, {
                    body: message,
                    tag: data.message.threadId.toString(),
                    data: {
                        preferredUrl: `/talking/${data.message.threadId}`,
                    },
                });
            } else if (data.type === 19) {
                // hard invited
                const ownerNickname = data.thread.topTenMembers.find(t => t.isOwner)?.nickName;
                const title = `You are invited to ${ownerNickname}'s thread`;
                const message = data.thread.name;

                await sw.registration.showNotification(title, {
                    body: message,
                    tag: data.thread.id.toString(),
                    data: {
                        preferredUrl: `/talking/${data.thread.id}`,
                    },
                });
            }
        })()
    )
);
