import { Injectable } from '@angular/core';
import { AuthApiService } from './Api/AuthApiService';
import { Router } from '@angular/router';
import { MessageService } from './MessageService';
import { CacheService } from './CacheService';
import { ThemeService } from './ThemeService';
import Swal from 'sweetalert2';
import { ApiService } from './Api/ApiService';
import { EventService } from './EventService';
import { GlobalNotifyService } from './GlobalNotifyService';
import { lastValueFrom } from 'rxjs';
import { MyContactsRepository } from '../Repositories/MyContactsRepository';
import { WebpushService } from './WebpushService';
import { MyThreadsRepository } from '../Repositories/ThreadsRepository';

@Injectable({
    providedIn: 'root',
})
export class InitService {
    constructor(
        private apiService: ApiService,
        private authApiService: AuthApiService,
        private router: Router,
        private messageService: MessageService,
        private cacheService: CacheService,
        private themeService: ThemeService,
        private webpushService: WebpushService,
        private eventService: EventService,
        private globalNotifyService: GlobalNotifyService,
        private myContactsRepository: MyContactsRepository,
        private myThreadsRepository: MyThreadsRepository
    ) {}

    public async init(): Promise<void> {
        if (navigator.userAgent.match(/MSIE|Trident/)) {
            Swal.fire(
                'Oops, it seems that you are opening Kahla in IE.',
                "Please note that Kahla doesn't support IE :(<br/>" +
                    'We recommend upgrading to the latest <a href="https://mozilla.org/firefox/">Firefox</a>, ' +
                    '<a href="https://chrome.google.com">Google Chrome, </a>' +
                    'or <a href="https://www.microsoft.com/en-us/windows/microsoft-edge">Microsoft Edge</a>.'
            );
        }
        console.log('Welcome to Kahla.App!');
        // load server config
        this.cacheService.serverConfig = await lastValueFrom(this.apiService.ServerInfo());
        this.cacheService.initCache();
        this.myContactsRepository.initCache();
        this.myThreadsRepository.initCache();
        console.log('[ OK ] Local cache initialized.');

        if (this.cacheService.serverConfig) {
            let signedIn = false;
            try {
                const me_resp = await lastValueFrom(this.authApiService.Me());
                this.cacheService.cachedData.me = me_resp.user;
                this.cacheService.cachedData.options = me_resp.privateSettings;
                signedIn = true;
            } catch (error) {
                console.log(error);
            }

            if (!signedIn) {
                console.warn('[WARN] User not signed in. Redirecting to signin page.');
                this.router.navigate(['/signin'], { replaceUrl: true });
            } else {
                console.log('[ OK ] User signed in.');
                if (this.router.isActive('/signin', false)) {
                    this.router.navigate(['/home'], { replaceUrl: true });
                }

                // Webpush Service
                this.webpushService.webpushInit();

                // Init stargate push
                this.eventService.initPusher();
                this.eventService.onMessage.subscribe(t => this.messageService.OnMessage(t));
                this.eventService.onReconnect.subscribe(() => this.messageService.reconnectPull());
                this.globalNotifyService.init();

                // Load User Info
                // this.cacheService.cachedData.me.avatarURL =
                //     this.probeService.encodeProbeFileUrl(this.cacheService.cachedData.me.iconFilePath);
                this.themeService.ApplyThemeFromRemote(this.cacheService.cachedData.options);

                // Fire and forget updates
                this.myContactsRepository.updateAll();
                this.myThreadsRepository.updateAll();
            }
        } else {
            this.router.navigate(['/signin'], { replaceUrl: true });
            Swal.fire('Server is not available', 'Please try again later.', 'error');
        }
    }

    public destroy(): void {
        this.eventService.destroyConnection();
        this.messageService.resetVariables();
        this.cacheService.reset();
        localStorage.clear();
    }
}
