import { Component, OnInit } from '@angular/core';
import { CacheService } from '../Services/CacheService';
import Swal from 'sweetalert2';
import { Device } from '../Models/Device';

@Component({
    templateUrl: '../Views/devices.html',
    styleUrls: ['../Styles/menu.scss']
})
export class DevicesComponent implements OnInit {
    constructor(
        public cacheService: CacheService,
    ) {
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
}
