export function mapDeviceName(ua: string) {
    if (ua !== null && ua.length >= 0) {
        const deviceName = [];
        // OS
        if (ua.includes('Win')) {
            deviceName.push('Windows');
        } else if (ua.includes('Android')) {
            deviceName.push('Android');
        } else if (ua.includes('Linux')) {
            deviceName.push('Linux');
        } else if (ua.includes('iPhone') || ua.includes('iPad')) {
            deviceName.push('iOS');
        } else if (ua.includes('Mac')) {
            deviceName.push('macOS');
        } else {
            deviceName.push('Unknown OS');
        }

        // Browser Name
        if (ua.includes('Firefox') && !ua.includes('Seamonkey')) {
            deviceName.push('Firefox');
        } else if (ua.includes('Seamonkey')) {
            deviceName.push('Seamonkey');
        } else if (ua.includes('Edge')) {
            deviceName.push('Microsoft Edge');
        } else if (ua.includes('Edg')) {
            deviceName.push('Edge Chromium');
        } else if (ua.includes('Chrome') && !ua.includes('Chromium')) {
            deviceName.push('Chrome');
        } else if (ua.includes('Chromium')) {
            deviceName.push('Chromium');
        } else if (ua.includes('Safari') && (!ua.includes('Chrome') || !ua.includes('Chromium'))) {
            deviceName.push('Safari');
        } else if (ua.includes('Opera') || ua.includes('OPR')) {
            deviceName.push('Opera');
        } else if (ua.match(/MSIE|Trident/)) {
            deviceName.push('Internet Explorer');
        } else {
            deviceName.push('Unknown browser');
        }

        return deviceName.join('-');
    }

    return null;
}
