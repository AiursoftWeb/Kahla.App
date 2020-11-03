export class Device {
    public id: number;
    public name: string;
    public ipAddress: string;
    public userID: string;
    public addTime: string;
}

export class Devices {
    public devices: Device[] = [];
}

export class LocalDevice {
    constructor(
        remoteDeivce: Device,
        currentId: number) {
        this.remoteDevice = remoteDeivce;
        this.isCurrent = currentId === remoteDeivce.id;
        this.osName = LocalDevice.getOSName(remoteDeivce.name);
        this.browserName = LocalDevice.getBrowserName(remoteDeivce.name);
    }
    public remoteDevice: Device;
    public isCurrent: boolean;
    public osName: string;
    public browserName: string;

    private static getOSName(sourceName: string): string {
        if (sourceName.includes('Win')) {
            return 'Windows';
        } else if (sourceName.includes('Android')) {
            return 'Android';
        } else if (sourceName.includes('Linux')) {
            return 'Linux';
        } else if (sourceName.includes('iPhone') || sourceName.includes('iPad')) {
            return 'iOS';
        } else if (sourceName.includes('Mac')) {
            return 'macOS';
        } else {
            return 'Unknown OS';
        }
    }

    private static getBrowserName(sourceName: string): string {
        if (sourceName.includes('Firefox') && !sourceName.includes('Seamonkey')) {
            return 'Firefox';
        } else if (sourceName.includes('Seamonkey')) {
            return 'Seamonkey';
        } else if (sourceName.includes('Edge')) {
            return 'Microsoft Edge';
        } else if (sourceName.includes('Edg')) {
            return 'Edge Chromium';
        } else if (sourceName.includes('Chrome') && !sourceName.includes('Chromium')) {
            return 'Chrome';
        } else if (sourceName.includes('Chromium')) {
            return 'Chromium';
        } else if (sourceName.includes('Safari') && (!sourceName.includes('Chrome') || !sourceName.includes('Chromium'))) {
            return 'Safari';
        } else if (sourceName.includes('Opera') || sourceName.includes('OPR')) {
            return 'Opera';
        } else if (sourceName.match(/MSIE|Trident/)) {
            return 'Internet Explorer';
        } else {
            return 'Unknown browser';
        }
    }
}
