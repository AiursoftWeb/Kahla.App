import { Injectable } from '@angular/core';
import { PushSubscriptionSetting } from '../Models/PushSubscriptionSetting';
import { DeviceRepo } from '../Repos/DeviceRepo';
import { ServerManager } from '../Repos/ServerManager';
import { DevicesApiService } from './Api/DevicesApiService';
import { BrowserContextService } from './BrowserContextService';
import { LocalStoreService } from './LocalstoreService';

@Injectable()
export class SubscriptionManager {
    constructor(
        private browserContext: BrowserContextService,
        private localStore: LocalStoreService,
        private devicesApiService: DevicesApiService,
        private deviceRepo: DeviceRepo,
        private serverRepo: ServerManager) {

    }

    private async getSubscription(): Promise<PushSubscription> {
        const registration = await navigator.serviceWorker.ready;
        let sub = await registration.pushManager.getSubscription();
        if (sub === null) {
            console.warn('Subscription out of date. Will try resubscribe now...');
            const server = await this.serverRepo.getOurServer();
            sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: server.vapidPublicKey
            });
        }
        return sub;
    }

    public async setKahlaDevice(enable: boolean) {

        const localSubSettings = this.localStore.get(LocalStoreService.PUSH_SUBSCRIPTION, PushSubscriptionSetting);

        if (enable) {
            const subscription = await this.getSubscription();
            if (localSubSettings.deviceId && (await this.deviceRepo.getDevices(false)).some(de => de.remoteDevice.id === localSubSettings.deviceId)) {
                await this.devicesApiService.UpdateDevice(
                    localSubSettings.deviceId,
                    navigator.userAgent,
                    subscription.endpoint,
                    subscription.toJSON().keys.p256dh,
                    subscription.toJSON().keys.auth);
            } else {
                const addedDevice = await this.devicesApiService.AddDevice(
                    navigator.userAgent,
                    subscription.endpoint,
                    subscription.toJSON().keys.p256dh,
                    subscription.toJSON().keys.auth);
                this.deviceRepo.setCurrentDeviceId(addedDevice.value);
            }
        } else {
            if (localSubSettings.deviceId) {
                await this.devicesApiService.DropDevice(localSubSettings.deviceId);
                localSubSettings.deviceId = 0;
                this.localStore.update(LocalStoreService.PUSH_SUBSCRIPTION, PushSubscriptionSetting, t => t.deviceId = 0);
            }
        }
    }

    public async registerWebPushOnce() {
        const localSubSettings = this.localStore.get(LocalStoreService.PUSH_SUBSCRIPTION, PushSubscriptionSetting);
        await this.setKahlaDevice(localSubSettings.enabled);
    }

    public async registerWebPush() {
        if (this.browserContext.permittedForWebPush()) {
            await this.registerWebPushOnce();
            navigator.serviceWorker.addEventListener('pushsubscriptionchange', () => this.registerWebPushOnce());
        } else {
            console.error('Get subscription failed! The browser might not support webpush.');
        }
    }
}
