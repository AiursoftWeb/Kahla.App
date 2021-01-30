import { Component, HostListener, OnInit } from '@angular/core';
import { InitService } from '../Services/InitService';
import Swal from 'sweetalert2';
import { ThemeService } from '../Services/ThemeService';
import { Router } from '@angular/router';
import { HomeService } from '../Services/HomeService';
import { CacheService } from '../Services/CacheService';
import { BrowserContextService } from '../Services/BrowserContextService';

@Component({
    selector: 'app-kahla',
    templateUrl: '../Views/app.html',
    styleUrls: ['../Styles/app.scss']
})


export class AppComponent implements OnInit {

    constructor(
        private initService: InitService,
        private themeService: ThemeService,
        public cacheService: CacheService,
        public route: Router,
        public homeService: HomeService,
        private browserContext: BrowserContextService) {
    }

    @HostListener('window:popstate', [])
    onPopstate() {
        Swal.close();
    }

    @HostListener('window:load', [])
    onLoad() {
        if (this.browserContext.isInternetExplorer()) {
            Swal.fire(
                'Oops, it seems that you are opening Kahla in IE.',
                'Please note that Kahla doesn\'t support IE :(<br/>' +
                'We recommend upgrading to the latest <a href="https://mozilla.org/firefox/">Firefox</a>, ' +
                '<a href="https://chrome.google.com">Google Chrome, </a>' +
                'or <a href="https://www.microsoft.com/en-us/windows/microsoft-edge">Microsoft Edge</a>.'
            );
        }
        if (this.browserContext.supportNotification()) {
            if (this.browserContext.supportWebPush()) {
                navigator.serviceWorker.register('/sw.js').then(function (registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function (err) {
                    console.error('ServiceWorker registration failed: ', err);
                });
            }

            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }

    @HostListener('window:beforeinstallprompt', ['$event'])
    onbeforeinstallprompt(e: any) {
        this.homeService.pwaHomeScreenPrompt = e;
    }

    public async ngOnInit(): Promise<void> {
        // Temporary apply the local theme setting
        this.themeService.ApplyThemeFromLocal();
        await this.initService.init();
    }
}
