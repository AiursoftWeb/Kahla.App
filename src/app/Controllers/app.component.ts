import { Component, HostListener, ElementRef } from '@angular/core';
import { OnInit } from '@angular/core';
import { InitService } from '../Services/InitService';
import Swal from 'sweetalert2';
import { ElectronService } from 'ngx-electron';
import { ThemeService } from '../Services/ThemeService';

@Component({
    selector: 'app-kahla',
    templateUrl: '../Views/app.html',
    styleUrls: ['../Styles/app.css']
})


export class AppComponent implements OnInit {

    constructor(
        public initService: InitService,
        private elementRef: ElementRef,
        private themeService: ThemeService,
        private _electronService: ElectronService) {
    }

    @HostListener('window:popstate', [])
    onPopstate() {
        Swal.close();
    }

    @HostListener('window:load', [])
    onLoad() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            if (!this._electronService.isElectronApp) {
                navigator.serviceWorker.register('/sw.js').then(function (registration) {
                    // Registration was successful
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function (err) {
                    // registration failed :(
                    console.log('ServiceWorker registration failed: ', err);
                });
            }

            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }

    public ngOnInit(): void {
        // Temporary apply the local theme setting
        this.themeService.ApplyThemeFromLocal(this.elementRef);
        this.initService.init(this.elementRef);
    }
}
