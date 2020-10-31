import { Component, OnInit } from '@angular/core';
import { AuthApiService } from '../Services/Api/AuthApiService';
import { KahlaUser } from '../Models/KahlaUser';
import Swal from 'sweetalert2';
import { CacheService } from '../Services/CacheService';
import { ProbeService } from '../Services/ProbeService';


@Component({
    templateUrl: '../Views/advanced-settings.html',
    styleUrls: ['../Styles/menu.scss',
        '../Styles/button.scss',
        '../Styles/toggleButton.scss']
})
export class AdvancedSettingComponent implements OnInit {

    public me: KahlaUser;

    constructor(
        private authApiService: AuthApiService,
        private cacheService: CacheService,
        private probeService: ProbeService,
    ) {
    }

    public async ngOnInit(): Promise<void> {
        if (this.cacheService.cachedData.me) {
            this.me = Object.assign({}, this.cacheService.cachedData.me);
        } else {
            const me = await this.authApiService.Me();
            this.me = me.value;
            this.me.avatarURL = this.probeService.encodeProbeFileUrl(this.me.iconFilePath);
        }
    }

    public async updateSettings(): Promise<void> {
        const res = await this.authApiService.UpdateClientSetting(null,
            this.me.enableEmailNotification,
            this.me.enableEnterToSendMessage,
            this.me.enableInvisiable,
            this.me.markEmailPublic,
            this.me.listInSearchResult);
        if (res.code === 0) {
            this.cacheService.cachedData.me = Object.assign({}, this.me);
            this.cacheService.saveCache();
        } else {
            Swal.fire('Error', res.message, 'error');
        }
    }

    public todo(): void {
        Swal.fire('Under development', 'This features is still under development ^_^.', 'info');
    }
}
