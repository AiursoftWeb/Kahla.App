import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CacheService } from './CacheService';
import { ThemeService } from './ThemeService';
import Swal from 'sweetalert2';
import { ApiService } from './Api/ApiService';
import { EventService } from './EventService';
import { GlobalNotifyService } from './GlobalNotifyService';
import { lastValueFrom } from 'rxjs';
import { MyContactsRepository } from '../Repositories/MyContactsRepository';
import { WebpushService } from './WebpushService';
import { MyThreadsOrderedRepository } from '../Repositories/MyThreadsOrderedRepository';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class InitService {
    constructor(
        private apiService: ApiService,
        private router: Router,
        private cacheService: CacheService,
        private themeService: ThemeService,
        private webpushService: WebpushService,
        private eventService: EventService,
        private globalNotifyService: GlobalNotifyService,
        private myContactsRepository: MyContactsRepository,
        private myThreadsOrderedRepository: MyThreadsOrderedRepository
    ) {}

    public async init(): Promise<void> {
        console.log('Welcome to Kahla.App!');

        this.myContactsRepository.initCache();
        this.myThreadsOrderedRepository.initCache();
        console.log('[ OK ] Local cache initialized.');

        // load server config
        this.cacheService.serverConfig = await lastValueFrom(this.apiService.ServerInfo());

        if (this.cacheService.serverConfig) {
            try {
                await this.cacheService.mineCache.update();
            } catch (error) {
                console.log(error);
                if (error instanceof HttpErrorResponse && error.status === 401) {
                    // Unauthorized, user not sign in
                    console.warn('[WARN] User not signed in. Redirecting to signin page.');
                    this.router.navigate(['/signin'], { replaceUrl: true });
                    return;
                } else {
                    console.warn('[WARN] Network not avail. Cannot update my info.');
                }
            }

            console.log('[ OK ] User signed in.');
            if (this.router.isActive('/signin', false)) {
                this.router.navigate(['/home'], { replaceUrl: true });
            }

            // Webpush Service
            this.webpushService.webpushInit();

            // Init global push
            this.eventService.initPusher();
            this.globalNotifyService.init();

            // Load User Info
            // this.cacheService.cachedData.me.avatarURL =
            //     this.probeService.encodeProbeFileUrl(this.cacheService.cachedData.me.iconFilePath);
            this.themeService.ApplyThemeFromRemote(this.cacheService.mine().privateSettings);

            // Fire and forget updates
            this.myContactsRepository.updateAll();
            this.myThreadsOrderedRepository.updateAll();
        } else {
            this.router.navigate(['/signin'], { replaceUrl: true });
            Swal.fire('Server is not available', 'Please try again later.', 'error');
        }
    }

    public destroy(): void {
        this.eventService.destroyConnection();
        localStorage.clear();
    }
}
