import { Component, OnInit } from '@angular/core';
import { ApiService } from '../Services/ApiService';
import { Location } from '@angular/common';
import { AppComponent } from './app.component';
import { Router } from '@angular/router';
import { KahlaUser } from '../Models/KahlaUser';

@Component({
    templateUrl: '../Views/settings.html',
    styleUrls: ['../Styles/menu.css']
})
export class SettingsComponent implements OnInit {
    public accountServer: string;

    constructor(
        private apiService: ApiService,
        private router: Router,
        private location: Location) {
    }

    public ngOnInit(): void {
        this.apiService.ExchangeServerAddress()
            .subscribe(server => this.accountServer = server.value);
    }

    public GetMe(): KahlaUser {
        return AppComponent.me;
    }

    public SignOut(): void {
        this.apiService.LogOff();
        localStorage.removeItem('cred');
        AppComponent.CurrentApp.destory();
        this.router.navigate(['/kahla/signin']);
    }
}
