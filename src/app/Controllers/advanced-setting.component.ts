import { Component, OnInit } from '@angular/core';
import { AuthApiService } from '../Services/AuthApiService';
import { KahlaUser } from '../Models/KahlaUser';
import Swal from 'sweetalert2';
import { CacheService } from '../Services/CacheService';
import { ProbeService } from '../Services/ProbeService';
import { Subscription } from 'rxjs';


@Component({
    templateUrl: '../Views/advanced-settings.html',
    styleUrls: ['../Styles/menu.scss',
        '../Styles/button.scss',
        '../Styles/toggleButton.scss']
})
export class AdvancedSettingComponent implements OnInit {

    public me: KahlaUser;
    public updatingSetting: Subscription;

    constructor(
        private authApiService: AuthApiService,
        private cacheService: CacheService,
        private probeService: ProbeService,
    ) {
    }

    ngOnInit(): void {
        if (this.cacheService.cachedData.me) {
            this.me = Object.assign({}, this.cacheService.cachedData.me);
        } else {
            this.authApiService.Me().subscribe(p => {
                this.me = p.value;
                this.me.avatarURL = this.probeService.encodeProbeFileUrl(this.me.iconFilePath);
            });
        }
    }

    public updateSettings(): void {
        if (this.updatingSetting && !this.updatingSetting.closed) {
            this.updatingSetting.unsubscribe();
            this.updatingSetting = null;
        }
        this.updatingSetting = this.authApiService.UpdateClientSetting(null,
            this.me.enableEmailNotification,
            this.me.enableEnterToSendMessage,
            this.me.enableInvisiable,
            this.me.markEmailPublic,
            this.me.listInSearchResult)
            .subscribe(res => {
                this.updatingSetting = null;

                if (res.code === 0) {
                    this.cacheService.cachedData.me = Object.assign({}, this.me);
                    this.cacheService.saveCache();
                } else {
                    Swal.fire('Error', res.message, 'error');
                }
            });
    }

    public todo(): void {
        Swal.fire('Under development', 'This features is still under development ^_^.', 'info');
    }
}
