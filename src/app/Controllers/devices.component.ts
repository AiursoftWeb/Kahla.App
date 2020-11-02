import { Component, OnInit } from '@angular/core';
import { CacheService } from '../Services/CacheService';
import Swal from 'sweetalert2';
import { Device, LocalDevice } from '../Models/Device';
import { DevicesApiService } from '../Services/Api/DevicesApiService';
import { PushSubscriptionSetting } from '../Models/PushSubscriptionSetting';
import { InitService } from '../Services/InitService';
import { LocalStoreService } from '../Services/LocalstoreService';
import { BrowserContextService } from '../Services/BrowserContextService';
import { DeviceRepo } from '../Repos/DeviceRepo';

@Component({
    templateUrl: '../Views/devices.html',
    styleUrls: ['../Styles/menu.scss',
        '../Styles/toggleButton.scss']
})
export class DevicesComponent implements OnInit {
    public devices: LocalDevice[];

    constructor(
        public devicesApiService: DevicesApiService,
        public initService: InitService,
        public localStore: LocalStoreService,
        public browserContext: BrowserContextService,
        private deviceRepo: DeviceRepo
    ) {
    }

    public async ngOnInit(): Promise<void> {
        this.devices = await this.deviceRepo.getDevices();
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

    public webpushSupported() {
        return this.browserContext.supportWebPush();
    }

    public async testPush(): Promise<void> {
        const pushResult = await this.devicesApiService.PushTestMessage();
        if (pushResult.code === 0) {
            Swal.fire('Successfully sent!', pushResult.message, 'info');
        }
    }

    public webPushEnabled(): boolean {
        return this.localStore.get(LocalStoreService.PUSH_SUBSCRIPTION, PushSubscriptionSetting).enabled;
    }

    public async setWebPushStatus(enable: boolean): Promise<void> {
        this.localStore.update(LocalStoreService.PUSH_SUBSCRIPTION, PushSubscriptionSetting, t => t.enabled = enable);
        this.devices = await this.deviceRepo.getDevices(false);
    }

    public getElectronNotify(): boolean {
        return this.localStore.get(LocalStoreService.PUSH_SUBSCRIPTION, PushSubscriptionSetting).enableElectron;
    }

    public setElectronNotify(enable: boolean) {
        this.localStore.update(LocalStoreService.PUSH_SUBSCRIPTION, PushSubscriptionSetting, t => t.enableElectron = enable);
    }
}
