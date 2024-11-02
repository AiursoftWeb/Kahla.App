export function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function checkEmoji(text: string): boolean {
    if (text.length > 2) {
        return false;
    }
    const regex =
        /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
    return regex.test(text);
}

export function humanReadableBytes(bytes: number) {
    const unit = ['', 'K', 'M', 'G', 'T'];
    let current = 0;
    while (current < unit.length && bytes > 1024) {
        bytes /= 1024;
        current++;
    }

    return `${bytes.toFixed(2)} ${unit[current]}B`;
}
