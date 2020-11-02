import { Injectable } from '@angular/core';
import { PushSubscriptionSetting } from '../Models/PushSubscriptionSetting';
import { DeviceRepo } from '../Repos/DeviceRepo';
import { DevicesApiService } from './Api/DevicesApiService';
import { BrowserContextService } from './BrowserContextService';
import { LocalStoreService } from './LocalstoreService';

@Injectable()
export class SubscriptionManager {
    private options = {
        userVisibleOnly: true,
        applicationServerKey: null
    };

    constructor(
        private browserContext: BrowserContextService,
        private localStore: LocalStoreService,
        private devicesApiService: DevicesApiService,
        private deviceRepo: DeviceRepo) {

    }

    private async getSubscription(): Promise<PushSubscription> {
        const registration = await navigator.serviceWorker.ready;
        let sub = await registration.pushManager.getSubscription();
        if (sub === null) {
            console.warn('Subscription out of date. Will try resubscribe now...');
            sub = await registration.pushManager.subscribe(this.options);
        }
        return sub;
    }

    private async registerSubscriptionAsDevice(pushSubscription: PushSubscription): Promise<void> {

        const localSubSettings = this.localStore.get(LocalStoreService.PUSH_SUBSCRIPTION, PushSubscriptionSetting);

        if (!localSubSettings.enabled && localSubSettings.deviceId) {
            await this.devicesApiService.DropDevice(localSubSettings.deviceId);
            localSubSettings.deviceId = 0;
            this.localStore.replace(LocalStoreService.PUSH_SUBSCRIPTION, localSubSettings);
        } else if (localSubSettings.enabled) {
            if (localSubSettings.deviceId && (await this.deviceRepo.getDevices(false)).some(de => de.remoteDevice.id === localSubSettings.deviceId)) {
                await this.devicesApiService.UpdateDevice(
                    localSubSettings.deviceId,
                    navigator.userAgent,
                    pushSubscription.endpoint,
                    pushSubscription.toJSON().keys.p256dh,
                    pushSubscription.toJSON().keys.auth);
            } else {
                const addedDevice = await this.devicesApiService.AddDevice(
                    navigator.userAgent,
                    pushSubscription.endpoint,
                    pushSubscription.toJSON().keys.p256dh,
                    pushSubscription.toJSON().keys.auth);
                this.deviceRepo.setCurrentDeviceId(addedDevice.value);
            }
        }
    }

    public async registerWebPushOnce() {
        const subscription = await this.getSubscription();
        await this.registerSubscriptionAsDevice(subscription);
    }

    public async registerWebPush() {
        if (this.browserContext.permittedForWebPush()) {
            this.registerWebPushOnce();
            navigator.serviceWorker.addEventListener('pushsubscriptionchange', () => this.registerWebPushOnce());
        } else {
            console.error('Get subscription failed! The browser might not support webpush.');
        }
    }
}
