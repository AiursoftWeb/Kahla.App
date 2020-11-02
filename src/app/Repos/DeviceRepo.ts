import { Injectable } from '@angular/core';
import { LocalDevice, Device, Devices } from '../Models/Device';
import { PushSubscriptionSetting } from '../Models/PushSubscriptionSetting';
import { DevicesApiService } from '../Services/Api/DevicesApiService';
import { LocalStoreService } from '../Services/LocalstoreService';

@Injectable()
export class DeviceRepo {

    constructor(
        private deviceApi: DevicesApiService,
        private localStore: LocalStoreService) {

    }

    private async pullRemoteDevices(): Promise<Device[]> {
        const remoteDevices = await this.deviceApi.MyDevices();
        this.localStore.replace<Devices>(LocalStoreService.REMOTE_DEVICES, { devices: remoteDevices.items });
        return remoteDevices.items;
    }

    private async getRemoteDevices(allowCache = true): Promise<Device[]> {
        let devices = this.localStore.get(LocalStoreService.REMOTE_DEVICES, Devices).devices;
        if (!devices.length || !allowCache) {
            devices = await this.pullRemoteDevices();
        }
        return devices;
    }

    public getCurrentDeviceId(): number {
        return this.localStore.get(LocalStoreService.PUSH_SUBSCRIPTION, PushSubscriptionSetting).deviceId;
    }

    public setCurrentDeviceId(newId: number) {
        this.localStore.update(LocalStoreService.PUSH_SUBSCRIPTION, PushSubscriptionSetting, (t) => t.deviceId = newId);
    }

    public async getDevices(allowCache = true): Promise<LocalDevice[]> {
        const remoteDevices = await this.getRemoteDevices(allowCache);
        return remoteDevices.map(t => new LocalDevice(t, this.getCurrentDeviceId()));
    }
}
