import { Component } from '@angular/core';
import { ApiService } from '../Services/ApiService';
import { AppComponent } from './app.component';
import { Router } from '@angular/router';
import { KahlaUser } from '../Models/KahlaUser';

@Component({
    templateUrl: '../Views/settings.html',
    styleUrls: ['../Styles/menu.css']
})
export class SettingsComponent {
    constructor(
        private apiService: ApiService,
        private router: Router) {
    }

    public GetMe(): KahlaUser {
        return AppComponent.me;
    }

    public SignOut(): void {
        this.apiService.LogOff().subscribe(() => {
            AppComponent.CurrentApp.destory();
            this.router.navigate(['/kahla/signin']);
        });
    }
}
