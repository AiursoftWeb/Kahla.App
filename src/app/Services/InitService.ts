import { Injectable } from '@angular/core';
import { CheckService } from './CheckService';
import { AuthApiService } from './Api/AuthApiService';
import { Router } from '@angular/router';
import { MessageService } from './MessageService';
import { CacheService } from './CacheService';
import { ElectronService } from 'ngx-electron';
import { DevicesApiService } from './Api/DevicesApiService';
import { ThemeService } from './ThemeService';
import Swal from 'sweetalert2';
import { ProbeService } from './ProbeService';
import { ServerConfig } from '../Models/ServerConfig';
import { ApiService } from './Api/ApiService';
import { ServerListApiService } from './Api/ServerListApiService';
import { PushSubscriptionSetting } from '../Models/PushSubscriptionSetting';
import { EventService } from './EventService';
import { GlobalNotifyService } from './GlobalNotifyService';

@Injectable({
    providedIn: 'root'
})
export class InitService {
    private options = {
        userVisibleOnly: true,
        applicationServerKey: null
    };

    constructor(
        private apiService: ApiService,
        private checkService: CheckService,
        private authApiService: AuthApiService,
        private router: Router,
        private messageService: MessageService,
        private cacheService: CacheService,
        private _electronService: ElectronService,
        private themeService: ThemeService,
        private devicesApiService: DevicesApiService,
        private probeService: ProbeService,
        private serverListApiService: ServerListApiService,
        private eventService: EventService,
        private globalNotifyService: GlobalNotifyService,
    ) {
    }

    public async init(): Promise<void> {
        if (navigator.userAgent.match(/MSIE|Trident/)) {
            Swal.fire(
                'Oops, it seems that you are opening Kahla in IE.',
                'Please note that Kahla doesn\'t support IE :(<br/>' +
                'We recommend upgrading to the latest <a href="https://mozilla.org/firefox/">Firefox</a>, ' +
                '<a href="https://chrome.google.com">Google Chrome, </a>' +
                'or <a href="https://www.microsoft.com/en-us/windows/microsoft-edge">Microsoft Edge</a>.'
            );
        }
        await this.checkService.checkVersion(false);
        // load server config
        let reload = false;
        if (localStorage.getItem(this.apiService.STORAGE_SERVER_CONFIG)) {
            this.apiService.serverConfig = JSON.parse(localStorage.getItem(this.apiService.STORAGE_SERVER_CONFIG)) as ServerConfig;
            if (this.apiService.serverConfig._cacheVersion !== ServerConfig.CACHE_VERSION) {
                reload = true;
                this.apiService.serverConfig = null;
            }
        } else {
            reload = true;
        }
        if (reload) {
            this.router.navigate(['/signin'], {replaceUrl: true});
            const servers = await this.serverListApiService.Servers();
            let target: ServerConfig;
            if (this._electronService.isElectronApp) {
                target = servers[0];
            } else {
                target = servers.find(t => t.domain.client === window.location.origin);
            }

            if (target) {
                target.officialServer = true;
                target._cacheVersion = ServerConfig.CACHE_VERSION;
                this.apiService.serverConfig = target;
                localStorage.setItem(this.apiService.STORAGE_SERVER_CONFIG, JSON.stringify(target));
            }
            await this.init();
            return;
        }

        this.cacheService.initCache();

        if (this.apiService.serverConfig) {
            this.options.applicationServerKey = this.urlBase64ToUint8Array(this.apiService.serverConfig.vapidPublicKey);
            await this.checkService.checkApiVersion();
            const signInStatus = await this.authApiService.SignInStatus();
            if (signInStatus.value === false) {
                this.router.navigate(['/signin'], {replaceUrl: true});
            } else {
                if (this.router.isActive('/signin', false)) {
                    this.router.navigate(['/home'], {replaceUrl: true});
                }

                // Webpush Service
                if (!this._electronService.isElectronApp && navigator.serviceWorker) {
                    await this.cacheService.updateDevice();
                    await this.subscribeUser();
                    await this.updateSubscription();
                }

                // Init stargate push
                await this.eventService.initPusher();
                this.eventService.onMessage.subscribe(t => this.messageService.OnMessage(t));
                this.eventService.onReconnect.subscribe(() => this.messageService.reconnectPull());
                this.globalNotifyService.init();

                // Load User Info
                const me = await this.authApiService.Me();
                if (me.code === 0) {
                    this.cacheService.cachedData.me = me.value;
                    this.cacheService.cachedData.me.avatarURL = this.probeService.encodeProbeFileUrl(me.value.iconFilePath);
                    this.themeService.ApplyThemeFromRemote(me.value);
                    this.cacheService.updateConversation();
                    this.cacheService.updateFriends();
                    this.cacheService.updateRequests();
                }
            }
        } else {
            this.router.navigate(['/signin'], {replaceUrl: true});
        }
    }

    public destroy(): void {
        this.eventService.destroyConnection();
        this.messageService.resetVariables();
        this.cacheService.reset();
        localStorage.clear();
    }

    public async subscribeUser(): Promise<void> {
        if ('Notification' in window && 'serviceWorker' in navigator && Notification.permission === 'granted') {
            const registration = await navigator.serviceWorker.ready;
            let sub = await registration.pushManager.getSubscription();
            if (sub === null) {
                sub = await  registration.pushManager.subscribe(this.options);
            }
            await this.bindDevice(sub);
        }
    }

    public async bindDevice(pushSubscription: PushSubscription, force: boolean = false): Promise<void> {
        let data: PushSubscriptionSetting = JSON.parse(localStorage.getItem('setting-pushSubscription'));
        if (!data) {
            data = {
                enabled: true,
                deviceId: 0
            };
            localStorage.setItem('setting-pushSubscription', JSON.stringify(data));
        }
        if (!data.enabled && data.deviceId) {
            await this.devicesApiService.DropDevice(data.deviceId);
            data.deviceId = 0;
            localStorage.setItem('setting-pushSubscription', JSON.stringify(data));
        }
        if (data.enabled) {
            if (data.deviceId && this.cacheService.cachedData.devices.some(de => de.id === data.deviceId)) {
                if (force) {
                    await this.devicesApiService.UpdateDevice(data.deviceId, navigator.userAgent, pushSubscription.endpoint,
                        pushSubscription.toJSON().keys.p256dh, pushSubscription.toJSON().keys.auth);
                }
            } else {
                const addedDevice = await this.devicesApiService.AddDevice(navigator.userAgent, pushSubscription.endpoint,
                    pushSubscription.toJSON().keys.p256dh, pushSubscription.toJSON().keys.auth);
                data.deviceId = addedDevice.value;
                localStorage.setItem('setting-pushSubscription', JSON.stringify(data));
            }
        }

    }

    private async updateSubscription(): Promise<void> {
        if ('Notification' in window && 'serviceWorker' in navigator && Notification.permission === 'granted') {
            const registration = await navigator.serviceWorker.ready;
            navigator.serviceWorker.addEventListener('pushsubscriptionchange', async () => {
                const pushSubscription = await registration.pushManager.subscribe(this.options);
                await this.bindDevice(pushSubscription, true);
            });
        }
    }

    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
}
