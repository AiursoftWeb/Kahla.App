import { Component, HostListener, AfterViewInit, ElementRef } from '@angular/core';
import { OnInit } from '@angular/core';
import { InitService } from '../Services/InitService';
import Swal from 'sweetalert2';
import { Themes } from '../Models/Themes';

@Component({
    selector: 'app-kahla',
    templateUrl: '../Views/app.html',
    styleUrls: ['../Styles/app.css']
})


export class AppComponent implements OnInit, AfterViewInit {

    constructor(
        public initService: InitService,
        private elementRef: ElementRef) {
    }

    @HostListener('window:popstate', [])
    onPopstate() {
        Swal.close();
    }

    @HostListener('window:load', [])
    onLoad() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(function (registration) {
                // Registration was successful
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, function (err) {
                // registration failed :(
                console.log('ServiceWorker registration failed: ', err);
            });

            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }

    public ngOnInit(): void {
        this.initService.init();
    }

    public ngAfterViewInit(): void {
        const themeSet = localStorage.getItem('setting-theme');
        let theme: Themes;
        if (themeSet == null) {
            // load and set default setting
            theme = Themes.light;
            localStorage.setItem('setting-theme',theme.toString());
        } else {
            theme = parseInt(themeSet, 10) as Themes;
        }
        switch (theme) {
            case Themes.light:
                this.elementRef.nativeElement.ownerDocument.body.className = 'theme-light';
                break;
            case Themes.dark:
                this.elementRef.nativeElement.ownerDocument.body.className = 'theme-dark';
                break;
        }
    }
}
