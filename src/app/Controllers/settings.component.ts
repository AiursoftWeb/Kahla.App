import { Component } from '@angular/core';
import { AuthApiService } from '../Services/AuthApiService';
import { AppComponent } from './app.component';
import { Router } from '@angular/router';
import { KahlaUser } from '../Models/KahlaUser';
import { Values } from '../values';

@Component({
    templateUrl: '../Views/settings.html',
    styleUrls: ['../Styles/menu.css',
                '../Styles/button.css']
})
export class SettingsComponent {
    public loadingImgURL = Values.loadingImgURL;
    constructor(
        private authApiService: AuthApiService,
        private router: Router) {
        }

    public GetMe(): KahlaUser {
        return AppComponent.me;
    }

    public SignOut(): void {
        this.authApiService.LogOff().subscribe(() => {
            AppComponent.CurrentApp.destory();
            this.router.navigate(['/signin']);
        });
    }
}
