import { Component } from '@angular/core';
import { AuthApiService } from '../Services/AuthApiService';
import { Router } from '@angular/router';
import { KahlaUser } from '../Models/KahlaUser';
import { Values } from '../values';
import { InitService } from '../Services/InitService';
import { MessageService } from '../Services/MessageService';
import { HeaderService } from '../Services/HeaderService';

@Component({
    templateUrl: '../Views/settings.html',
    styleUrls: ['../Styles/menu.css',
                '../Styles/button.css']
})
export class SettingsComponent {
    public loadingImgURL = Values.loadingImgURL;
    constructor(
        private authApiService: AuthApiService,
        private router: Router,
        private initSerivce: InitService,
        public messageService: MessageService,
        private headerService: HeaderService) {
            this.headerService.title = 'Me';
            this.headerService.returnButton = false;
            this.headerService.button = false;
        }

    public GetMe(): KahlaUser {
        return this.messageService.me;
    }

    public SignOut(): void {
        this.authApiService.LogOff().subscribe(() => {
            this.initSerivce.destory();
            this.router.navigate(['/signin']);
        });
    }
}
