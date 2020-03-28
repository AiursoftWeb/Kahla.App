import { Component, OnInit } from '@angular/core';
import { CacheService } from '../Services/CacheService';
import Swal from 'sweetalert2';
import { Device } from '../Models/Device';
import { ElectronService } from 'ngx-electron';
import { DevicesApiService } from '../Services/DevicesApiService';
import { PushSubscriptionSetting } from '../Models/PushSubscriptionSetting';
import { InitService } from '../Services/InitService';

@Component({
    templateUrl: '../Views/devices.html',
    styleUrls: ['../Styles/menu.scss',
        '../Styles/toggleButton.scss']
})
export class DevicesComponent implements OnInit {
    constructor(
        public cacheService: CacheService,
        public electronService: ElectronService,
        public devicesApiService: DevicesApiService,
        public initService: InitService,
    ) {
    }

    public webPushEnabled: boolean;

    public ngOnInit(): void {
        this.cacheService.updateDevice();
        if (this.webpushSupported()) {
            this.webPushEnabled = this.getWebPushStatus();
        }
    }

    public detail(device: Device): void {
        if (device !== null) {
            Swal.fire({
                title: 'Device detail',
                html: '<table style="margin: auto;"><tr><th>Add IP</th><td>' + device.ipAddress +
                    '</td></tr><tr><th>Add time</th><td>' + new Date(device.addTime).toLocaleString() +
                    '</td></tr></table>'
            });
        }
    }

    public webpushSupported(): boolean {
        return !this.electronService.isElectronApp && 'Notification' in window && 'serviceWorker' in navigator;
    }

    public testPush(): void {
        this.devicesApiService.PushTestMessage().subscribe(t => {
            if (t.code === 0) {
                Swal.fire(
                    'Successfully sent!',
                    t.message,
                    'info'
                );
            }
        });
    }

    public getWebPushStatus(): boolean {
        if (!localStorage.getItem('setting-pushSubscription')) {
            return true;
        }
        const status: PushSubscriptionSetting = JSON.parse(localStorage.getItem('setting-pushSubscription'));
        return status.enabled;
    }

    public setWebPushStatus(value: boolean) {
        const status: PushSubscriptionSetting = localStorage.getItem('setting-pushSubscription') ?
            JSON.parse(localStorage.getItem('setting-pushSubscription')) :
            {
                enabled: value,
                deviceId: 0
            };
        status.enabled = value;
        localStorage.setItem('setting-pushSubscription', JSON.stringify(status));
        this.webPushEnabled = value;
        this.initService.subscribeUser();
    }
}
