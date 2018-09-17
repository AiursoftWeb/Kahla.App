import { Component, OnInit } from '@angular/core';
import { ApiService } from '../Services/ApiService';
import { AppComponent } from './app.component';
import { Router } from '@angular/router';
import { KahlaUser } from '../Models/KahlaUser';

@Component({
    templateUrl: '../Views/settings.html',
    styleUrls: ['../Styles/menu.css']
})
export class SettingsComponent implements OnInit {

    private option = { month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: 'numeric' };

    constructor(
        private apiService: ApiService,
        private router: Router) {
    }

    public ngOnInit(): void {
        this.apiService.Me().subscribe(p => {
            AppComponent.me = p.value;
            AppComponent.me.accountCreateTime = new Date(AppComponent.me.accountCreateTime + 'Z').toLocaleString([], this.option);
        });
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
