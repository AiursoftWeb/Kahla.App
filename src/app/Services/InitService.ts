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
import { LocalStoreService } from './LocalstoreService';
import { BrowserContextService } from './BrowserContextService';
import { Toolbox } from './Toolbox';

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
        private localStore: LocalStoreService,
        private browserContext: BrowserContextService,
        private toolbox: Toolbox
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
        const serverConfig = this.localStore.get(LocalStoreService.STORAGE_SERVER_CONFIG, ServerConfig);
        this.apiService.serverConfig = serverConfig;

        if (this.apiService.serverConfig._cacheVersion !== ServerConfig.CACHE_VERSION) {
            this.apiService.serverConfig = null;
            await this.reload();
        }

        this.cacheService.initCache();

        if (!this.apiService.serverConfig) {
            this.router.navigate(['/signin'], { replaceUrl: true });
            return;
        }

        this.options.applicationServerKey = this.toolbox.urlBase64ToUint8Array(this.apiService.serverConfig.vapidPublicKey);
        await this.checkService.checkApiVersion();
        const signInStatus = await this.authApiService.SignInStatus();
        if (signInStatus.value === false) {
            this.router.navigate(['/signin'], { replaceUrl: true });
            return;
        }

        if (this.router.isActive('/signin', false)) {
            this.router.navigate(['/home'], { replaceUrl: true });
        }

        // Webpush Service
        if (this.browserContext.permittedForWebPush()) {
            this.refreshWebPush();
            navigator.serviceWorker.addEventListener('pushsubscriptionchange', () => this.refreshWebPush());
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

    private async refreshWebPush() {
        await this.cacheService.updateDevice();
        const subscription = await this.getSubscription();
        if (subscription) {
            await this.registerSubscriptionAsDevice(subscription);
        }
    }

    private async reload(): Promise<void> {
        this.router.navigate(['/signin'], { replaceUrl: true });
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
            this.localStore.replace(LocalStoreService.STORAGE_SERVER_CONFIG, target);
        }
        await this.init();
    }

    public destroy(): void {
        this.eventService.destroyConnection();
        this.messageService.resetVariables();
        this.cacheService.reset();
        this.localStore.resetAll();
    }

    public async getSubscription(): Promise<PushSubscription> {
        if (this.browserContext.permittedForWebPush()) {
            const registration = await navigator.serviceWorker.ready;
            let sub = await registration.pushManager.getSubscription();
            if (sub === null) {
                sub = await registration.pushManager.subscribe(this.options);
            }
            return sub;
        } else {
            return null;
        }
    }

    public async registerSubscriptionAsDevice(pushSubscription: PushSubscription): Promise<void> {

        const localSubSettings = this.localStore.get(LocalStoreService.PUSH_SUBSCRIPTION, PushSubscriptionSetting);

        if (!localSubSettings.enabled && localSubSettings.deviceId) {
            await this.devicesApiService.DropDevice(localSubSettings.deviceId);
            localSubSettings.deviceId = 0;
            this.localStore.replace(LocalStoreService.PUSH_SUBSCRIPTION, localSubSettings);
        } else if (localSubSettings.enabled) {
            if (localSubSettings.deviceId && this.cacheService.cachedData.devices.some(de => de.id === localSubSettings.deviceId)) {
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
                this.localStore.update(LocalStoreService.PUSH_SUBSCRIPTION, PushSubscriptionSetting, (t) => t.deviceId = addedDevice.value);
            }
        }
    }
}
