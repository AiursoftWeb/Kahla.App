import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../Services/HeaderService';
import { AuthApiService } from '../Services/AuthApiService';
import { KahlaUser } from '../Models/KahlaUser';
import Swal from 'sweetalert2';
import { MessageService } from '../Services/MessageService';
import { DevicesApiService } from '../Services/DevicesApiService';

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
        private messageService: MessageService,
        private devicesApiService: DevicesApiService
    ) {
        this.headerService.returnButton = true;
        this.headerService.shadow = true;
        this.headerService.title = 'Advanced Setting';
    }

    ngOnInit(): void {
        this.me = this.messageService.me;
        this.authApiService.Me().subscribe(result => {
            this.me = result.value;
        });
    }

    updateEmailNotify(): void {
        if (!this.updatingSetting) {
            this.updatingSetting = true;
            this.authApiService.UpdateClientSetting(null, !this.me.enableEmailNotification).subscribe(res => {
                this.updatingSetting = false;
                if (res.code === 0) {
                    this.messageService.me.enableEmailNotification = this.me.enableEmailNotification = !this.me.enableEmailNotification;
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
