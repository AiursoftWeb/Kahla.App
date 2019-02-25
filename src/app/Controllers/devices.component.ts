import { Component, OnInit } from '@angular/core';
import { CacheService } from '../Services/CacheService';
import { HeaderService } from '../Services/HeaderService';

@Component({
    templateUrl: '../Views/devices.html',
    styleUrls: ['../Styles/menu.css']
})
export class DevicesComponent implements OnInit {

    constructor(
        public cacheService: CacheService,
        private headerService: HeaderService
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
}
