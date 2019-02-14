import { Component, HostListener } from '@angular/core';
import { OnInit } from '@angular/core';
import { InitService } from '../Services/InitService';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-kahla',
    templateUrl: '../Views/app.html',
    styleUrls: ['../Styles/app.css']
})


export class AppComponent implements OnInit {
    constructor(
        public initService: InitService) {
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

            navigator.serviceWorker.ready.then(function(registration) {
                registration.pushManager.getSubscription().then(function(sub) {
                    if (sub === null) {
                        registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: urlBase64ToUint8Array(environment.applicationServerKey)
                        }).then(function(pushSubscription) {
                            // send to server
                            console.log(pushSubscription);
                        });
                    }
                });
            });
        }

        function urlBase64ToUint8Array(base64String: string): Uint8Array {
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

    public ngOnInit(): void {
        this.initService.init();
    }
}
