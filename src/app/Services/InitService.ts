import { Injectable } from '@angular/core';
import { CheckService } from './CheckService';
import { AuthApiService } from './Api/AuthApiService';
import { Router } from '@angular/router';
import { MessageService } from './MessageService';
import { CacheService } from './CacheService';
import { ThemeService } from './ThemeService';
import { ProbeService } from './ProbeService';
import { EventService } from './EventService';
import { GlobalNotifyService } from './GlobalNotifyService';
import { LocalStoreService } from './LocalstoreService';
import { SubscriptionManager } from './SubscriptionManager';
import { ServerRepo } from '../Repos/ServerRepo';

@Injectable({
    providedIn: 'root'
})
export class InitService {
    constructor(
        private checkService: CheckService,
        private authApiService: AuthApiService,
        private router: Router,
        private messageService: MessageService,
        private cacheService: CacheService,
        private themeService: ThemeService,
        private probeService: ProbeService,
        private eventService: EventService,
        private globalNotifyService: GlobalNotifyService,
        private localStore: LocalStoreService,
        private subscriptionManager: SubscriptionManager,
        private serverRepo: ServerRepo
    ) {
    }

    public async init(): Promise<void> {
        await this.checkService.checkAndAlertAppVersion(false);

        this.cacheService.initCache(); // Obsolete

        if (!this.serverRepo.ourServerSet()) {
            this.router.navigate(['/signin'], { replaceUrl: true });
            return;
        }

        await this.checkService.checkAndAlertApiVersion();

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

    public destroy(): void {
        this.eventService.destroyConnection();
        this.messageService.resetVariables();
        this.cacheService.reset();
        this.localStore.resetAll();
    }
}
