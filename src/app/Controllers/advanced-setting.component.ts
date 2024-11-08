import { Component, OnInit } from '@angular/core';
import { AuthApiService } from '../Services/Api/AuthApiService';
import { KahlaUser } from '../Models/KahlaUser';
import Swal from 'sweetalert2';
import { CacheService } from '../Services/CacheService';
import { Subscription } from 'rxjs';
import { AppOptions } from '../Models/AppOptions';
import { showCommonErrorDialog } from '../Utils/CommonErrorDialog';

@Component({
    templateUrl: '../Views/advanced-settings.html',
    styleUrls: ['../Styles/menu.scss', '../Styles/button.scss'],
})
export class AdvancedSettingComponent implements OnInit {
    public me: KahlaUser;
    public options: AppOptions;
    public updatingSetting: Subscription;

    constructor(
        private authApiService: AuthApiService,
        private cacheService: CacheService
        // private probeService: ProbeService,
    ) {}

    ngOnInit(): void {
        if (this.cacheService?.cachedData?.me) {
            this.me = Object.assign({}, this.cacheService.cachedData.me);
            this.options = Object.assign({}, this.cacheService.cachedData.options);
        } else {
            this.authApiService.Me().subscribe(p => {
                this.me = p.user;
                this.options = p.privateSettings;
                // this.me.avatarURL = this.probeService.encodeProbeFileUrl(this.me.iconFilePath);
            });
        }
    }

    public updateSettings(): void {
        if (this.updatingSetting && !this.updatingSetting.closed) {
            this.updatingSetting.unsubscribe();
            this.updatingSetting = null;
        }
        this.updatingSetting = this.authApiService
            .UpdateMe({
                enableEmailNotification: this.options.enableEmailNotification,
                enableEnterToSendMessage: this.options.enableEnterToSendMessage,
                enableHideMyOnlineStatus: this.options.enableHideMyOnlineStatus,
                listInSearchResult: this.options.listInSearchResult,
                allowHardInvitation: this.options.allowHardInvitation,
            })
            .subscribe(
                () => {
                    this.updatingSetting = null;
                    this.cacheService.cachedData.options = Object.assign({}, this.options);
                    this.cacheService.saveCache();
                },
                err => {
                    this.updatingSetting = null;
                    showCommonErrorDialog(err);
                }
            );
    }

    public todo(): void {
        Swal.fire('Under development', 'This features is still under development ^_^.', 'info');
    }
}
