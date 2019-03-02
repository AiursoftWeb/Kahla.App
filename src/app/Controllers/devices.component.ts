import { Component, OnInit } from '@angular/core';
import { CacheService } from '../Services/CacheService';
import { HeaderService } from '../Services/HeaderService';
import Swal from 'sweetalert2';
import { Device } from '../Models/Device';
import { AuthApiService } from '../Services/AuthApiService';
@Component({
    templateUrl: '../Views/devices.html',
    styleUrls: ['../Styles/menu.css',
        '../Styles/button.css']
})
export class DevicesComponent implements OnInit {
    constructor(
        public cacheService: CacheService,
        private headerService: HeaderService,
        private authApiService: AuthApiService
    ) {
        this.headerService.title = 'Devices';
        this.headerService.returnButton = true;
        this.headerService.button = false;
        this.headerService.shadow = false;
    }

    public ngOnInit(): void {
        if (!this.cacheService.cachedData.devices) {
            this.cacheService.updateDevice();
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

    public testPush(): void {
        this.authApiService.PushTestMessage().subscribe(t => {
            if (t.code === 0) {
                Swal.fire(
                    'Successfully sent!',
                    t.message,
                    'info'
                );
            }
        });
    }
}
