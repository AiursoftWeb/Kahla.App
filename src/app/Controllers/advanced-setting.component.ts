import { Component, OnInit } from '@angular/core';
import { AuthApiService } from '../Services/AuthApiService';
import { KahlaUser } from '../Models/KahlaUser';
import Swal from 'sweetalert2';
import { DevicesApiService } from '../Services/DevicesApiService';
import { Values } from '../values';
import { CacheService } from '../Services/CacheService';

@Component({
    templateUrl: '../Views/advanced-settings.html',
    styleUrls: ['../Styles/menu.scss',
                '../Styles/button.scss',
                '../Styles/toggleButton.scss']
})
export class AdvancedSettingComponent implements OnInit {

    public me: KahlaUser;
    private updatingSetting = false;

    constructor(
        private authApiService: AuthApiService,
        private devicesApiService: DevicesApiService,
        private cacheService: CacheService
    ) {
    }

    ngOnInit(): void {
        if (this.cacheService.cachedData.me) {
            this.me = Object.assign({}, this.cacheService.cachedData.me);
        } else {
            this.authApiService.Me().subscribe(p => {
                this.me = p.value;
                this.me.avatarURL = Values.fileAddress + this.me.iconFilePath;
            });
        }
    }

    updateEmailNotify(): void {
        if (!this.updatingSetting) {
            this.updatingSetting = true;
            this.authApiService.UpdateClientSetting(null, !this.me.enableEmailNotification).subscribe(res => {
                this.updatingSetting = false;
                if (res.code === 0) {
                    this.cacheService.cachedData.me
                        .enableEmailNotification = this.me.enableEmailNotification = !this.me.enableEmailNotification;
                  } else {
                    Swal.fire('Error', res.message, 'error');
                  }
            });
        }
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

    public todo(): void {
        Swal.fire('Under development', 'This features is still under development ^_^.', 'info');
    }
}
