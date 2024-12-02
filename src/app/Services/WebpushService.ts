import { Injectable } from '@angular/core';
import { DevicesApiService } from './Api/DevicesApiService';
import { PushSubscriptionSetting } from '../Models/PushSubscriptionSetting';
import { CacheService } from './CacheService';
import { urlBase64ToUint8Array } from '../Utils/StringUtils';
import { lastValueFrom } from 'rxjs';
import { mapDeviceName } from '../Utils/UaMapper';
import { SwalToast } from '../Utils/Toast';

@Injectable({
    providedIn: 'root',
})
export class WebpushService {
    constructor(
        private devicesApiService: DevicesApiService,
        private cacheService: CacheService
    ) {}

    public get serviceWorkerAvailable(): boolean {
        return 'serviceWorker' in navigator && !('__TAURI__' in window);
    }

    public get requireUserApproval(): boolean {
        return 'Notification' in window && Notification.permission === 'default';
    }

    public get notificationAvail(): boolean {
        return (
            this.serviceWorkerAvailable &&
            'Notification' in window &&
            Notification.permission === 'granted'
        );
    }

    public get pushSettings(): PushSubscriptionSetting {
        const storage = JSON.parse(
            localStorage.getItem('setting-pushSubscription')
        ) as PushSubscriptionSetting | null;
        if (!storage) {
            return {
                enabled: true,
                deviceId: 0,
            };
        }
        return storage;
    }

    private updatePushSettings(value: PushSubscriptionSetting) {
        localStorage.setItem('setting-pushSubscription', JSON.stringify(value));
    }

    public async bindDevice(pushSubscription: PushSubscription, subscriptionChanged = false) {
        const settings = this.pushSettings;
        if (!settings.enabled) return;
        if (settings.deviceId) {
            if (!subscriptionChanged) return;
            console.log('[ ** ] Update push subscription for device...');
            await lastValueFrom(
                this.devicesApiService.UpdateDevice(
                    settings.deviceId,
                    navigator.userAgent,
                    pushSubscription.endpoint,
                    pushSubscription.toJSON().keys.p256dh,
                    pushSubscription.toJSON().keys.auth
                )
            );
            console.log('[ OK ] Device updated.');
        } else {
            console.log('[ ** ] Bind device for push subscription...');
            const resp = await lastValueFrom(
                this.devicesApiService.AddDevice(
                    navigator.userAgent,
                    pushSubscription.endpoint,
                    pushSubscription.toJSON().keys.p256dh,
                    pushSubscription.toJSON().keys.auth
                )
            );
            this.updatePushSettings({
                enabled: true,
                deviceId: resp.value,
            });
            console.log('[ OK ] Device binded.');
        }
    }

    public async unbindDevice() {
        if (this.pushSettings.enabled) return;
        if (this.pushSettings.deviceId) {
            console.log('[ ** ] Unbind device for push subscription...');
            await lastValueFrom(this.devicesApiService.DropDevice(this.pushSettings.deviceId));
            this.updatePushSettings({
                enabled: false,
                deviceId: 0,
            });
            console.log('[ OK ] Device unbinded.');
        }
    }

    public async getDeviceList() {
        const resp = await lastValueFrom(this.devicesApiService.MyDevices());
        resp.items.forEach(t => {
            [t._os, t._browser] = mapDeviceName(t.name) ?? ['Unknown OS', 'Unknown Browser'];
        });
        // should check if current device id has already been invalid
        if (
            this.pushSettings.deviceId &&
            !resp.items.find(t => t.id === this.pushSettings.deviceId)
        ) {
            // invalid id, remove it
            this.updatePushSettings({
                ...this.pushSettings,
                deviceId: 0,
            });
            console.log('[ ** ] Device id invalid, rotating.');
            this.subscribeUser(); // Re subscribe to rebind the device; Fire and forget
        }
        return resp.items;
    }

    public async webpushInit() {
        if (!this.notificationAvail || !this.pushSettings.enabled) return;
        await this.subscribeUser();
        await this.initSubscriptionUpdater();
    }

    public async updateEnabled(enabled: boolean) {
        this.updatePushSettings({
            ...this.pushSettings,
            enabled: enabled,
        });
        if (enabled) {
            await this.subscribeUser(true);
        } else {
            await this.unbindDevice();
        }
    }

    //#region Push subscription

    private get pushServerMetadata() {
        if (!this.cacheService.serverConfig) {
            throw new Error('Server config not loaded');
        }
        return {
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
                this.cacheService.serverConfig.vapidPublicKey
            ),
        };
    }

    public async registerServiceWorker() {
        console.info('[ ** ] Registering service worker...');
        if (!this.serviceWorkerAvailable) {
            console.error('[INFO] ServiceWorker not available in this environment, skipping.');
            return;
        }
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log(
                '[ OK ] ServiceWorker registration successful with scope: ',
                registration.scope
            );
            if (registration.waiting && registration.active) {
                console.log('[WARN] ServiceWorker update detected.');
                setTimeout(() => {
                    SwalToast.fire({
                        icon: 'info',
                        position: 'bottom-right',
                        title: 'A new version of the Kahla is ready.',
                        text: 'Please close and reopen all the page of the app to update.\nJust reloading the page cannot update the app.',
                    });
                }, 1000); // Delay fire to ensure the page is fully loaded and not to disturb the user
            }
        } catch (err) {
            console.error('[ERR!] ServiceWorker registration failed: ', err);
            return;
        }

        this.requestUserApproval();
    }

    public async subscribeUser(forceUpdate = false) {
        if (!this.notificationAvail) return;
        const registration = await navigator.serviceWorker.ready;
        let sub = await registration.pushManager.getSubscription();
        if (sub && forceUpdate) {
            await sub.unsubscribe();
            sub = null;
        }
        if (!sub) {
            sub = await registration.pushManager.subscribe(this.pushServerMetadata);
            console.log('[ OK ] Push subscription not exists, created new one.');
        }
        await this.bindDevice(sub);
    }

    public async unsubscribeUser() {
        if (!this.notificationAvail) return;
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
            await sub.unsubscribe();
        }
    }

    public async initSubscriptionUpdater() {
        if (!this.notificationAvail) return;
        navigator.serviceWorker.addEventListener('pushsubscriptionchange', async () => {
            console.log('[ ** ] Push subscription changed');
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.subscribe(this.pushServerMetadata);
            this.bindDevice(sub, true);
            console.log('[ OK ] Push subscription updated');
        });
    }

    public async requestUserApproval() {
        if (!this.requireUserApproval) return;
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('[ OK ] Notification permission granted.');
        } else {
            console.error('[ERR!] Notification permission denied.');
        }
    }

    //#endregion
}
