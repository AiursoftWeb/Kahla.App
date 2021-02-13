import { Component, OnInit } from '@angular/core';
import { AuthApiService } from '../Services/Api/AuthApiService';
import { KahlaUser } from '../Models/KahlaUser';
import Swal from 'sweetalert2';
import { MeRepo } from '../Repos/MeRepo';


@Component({
    templateUrl: '../Views/advanced-settings.html',
    styleUrls: ['../Styles/menu.scss',
        '../Styles/button.scss',
        '../Styles/toggleButton.scss']
})
export class AdvancedSettingComponent implements OnInit {

    public me: KahlaUser;
    public updatingSetting: boolean;

    constructor(
        private authApiService: AuthApiService,
        private meRepo: MeRepo
    ) {
    }

    public async ngOnInit(): Promise<void> {
        // Fast render
        const cachedResponse = await this.meRepo.getMe();
        this.me = cachedResponse.response;

        // Full load
        if (!cachedResponse.isLatest) {
            this.me = (await this.meRepo.getMe(false)).response;
        }
    }

    public async updateSettings(): Promise<void> {
        this.updatingSetting = true;
        const response = await this.authApiService.UpdateClientSetting(null,
            this.me.enableEmailNotification,
            this.me.enableEnterToSendMessage,
            this.me.enableInvisiable,
            this.me.markEmailPublic,
            this.me.listInSearchResult);
        if (response.code === 0) {
            this.meRepo.overrideCache(this.me);
        } else {
            Swal.fire('Error', response.message, 'error');
        }
        this.updatingSetting = false;
    }

    public todo(): void {
        Swal.fire('Under development', 'This features is still under development ^_^.', 'info');
    }
}
