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
import { KahlaHTTP } from './Api/KahlaHTTP';
import { ServerListApiService } from './Api/ServerListApiService';
import { EventService } from './EventService';
import { GlobalNotifyService } from './GlobalNotifyService';
import { LocalStoreService } from './LocalstoreService';
import { BrowserContextService } from './BrowserContextService';
import { Toolbox } from './Toolbox';
import { DeviceRepo } from '../Repos/DeviceRepo';
import { SubscriptionManager } from './SubscriptionManager';
import { ServersRepo } from '../Repos/ServersRepo';

@Injectable({
    providedIn: 'root'
})
export class InitService {
    constructor(
        private apiService: KahlaHTTP,
        private checkService: CheckService,
        private authApiService: AuthApiService,
        private router: Router,
        private messageService: MessageService,
        private cacheService: CacheService,
        private _electronService: ElectronService,
        private themeService: ThemeService,
        private probeService: ProbeService,
        private serverListApiService: ServerListApiService,
        private eventService: EventService,
        private globalNotifyService: GlobalNotifyService,
        private localStore: LocalStoreService,
        private browserContext: BrowserContextService,
        private subscriptionManager: SubscriptionManager,
        private serverConfigRepo: ServersRepo
    ) {
    }

    public async init(): Promise<void> {
        if (this.browserContext.isInternetExplorer()) {
            Swal.fire(
                'Oops, it seems that you are opening Kahla in IE.',
                'Please note that Kahla doesn\'t support IE :(<br/>' +
                'We recommend upgrading to the latest <a href="https://mozilla.org/firefox/">Firefox</a>, ' +
                '<a href="https://chrome.google.com">Google Chrome, </a>' +
                'or <a href="https://www.microsoft.com/en-us/windows/microsoft-edge">Microsoft Edge</a>.'
            );
        }
        await this.checkService.checkAppVersion(false);
        const serverConfig = this.serverConfigRepo.getServer();
        this.apiService.serverConfig = serverConfig;

        if (this.apiService.serverConfig._cacheVersion !== ServerConfig.CACHE_VERSION) {
            this.apiService.serverConfig = null;
            await this.backToServerSelection();
        }

        this.cacheService.initCache();

        if (!this.apiService.serverConfig) {
            this.router.navigate(['/signin'], { replaceUrl: true });
            return;
        }

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
        this.subscriptionManager.registerWebPush();

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

    private async backToServerSelection(): Promise<void> {
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
            this.localStore.replace(LocalStoreService.SERVER_CONFIG, target);
        }
        await this.init();
    }

    public destroy(): void {
        this.eventService.destroyConnection();
        this.messageService.resetVariables();
        this.cacheService.reset();
        this.localStore.resetAll();
    }
}
