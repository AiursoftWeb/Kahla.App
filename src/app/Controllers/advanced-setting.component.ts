import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../Services/HeaderService';
import { AuthApiService } from '../Services/AuthApiService';
import { KahlaUser } from '../Models/KahlaUser';
import Swal from 'sweetalert2';
import { MessageService } from '../Services/MessageService';

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
        private headerService: HeaderService,
        private authApiService: AuthApiService,
        private messageService: MessageService
    ) {
        this.headerService.returnButton = true;
        this.headerService.shadow = true;
        this.headerService.title = 'Advanced Setting';
    }

    ngOnInit(): void {
        this.authApiService.Me().subscribe(result => {
            this.me = result.value;
        });
    }

    updateEmailNotify(): void {
        if (!this.updatingSetting) {
            this.updatingSetting = true;
            this.me.enableEmailNotification = !this.me.enableEmailNotification;
            this.authApiService.UpdateClientSetting(null, this.me.enableEmailNotification).subscribe(res => {
                this.updatingSetting = false;
                if (res.code === 0) {
                    this.messageService.me.enableEmailNotification = this.me.enableEmailNotification;
                  } else {
                    Swal.fire('Error', res.message, 'error');
                  }
            });
        }
    }
}
