import { Component, OnInit } from '@angular/core';
import { ApiService } from '../Services/ApiService';
import { Location } from '@angular/common';
import { AppComponent } from './app.component';
import { Router } from '@angular/router';
import { GlobalValue } from '../Services/GlobalValue';

@Component({
    templateUrl: '../Views/signin.html',
    styleUrls: ['../Styles/signin.css']
})
export class SignInComponent implements OnInit {
    public email: string;
    public password: string;
    public connecting = false;

    constructor(
        private apiService: ApiService,
        private router: Router,
        private location: Location) { }

    public ngOnInit(): void {
        this.apiService.SignInStatus().subscribe(response => {
            if (response.value === true) {
                this.router.navigate(['/kahla/conversations']);
                AppComponent.CurrentApp.ngOnInit();
            }
        });
    }

    public signin(): void {
        if (this.connecting) {
            return;
        }
        this.connecting = true;
        this.apiService.AuthByPassword(this.email, this.password)
            .subscribe(t => {
                if (t.code === 0) {
                    GlobalValue.Credential = t.value;
                    localStorage.setItem('cred', t.value);
                    this.router.navigate(['/kahla/conversations']);
                    AppComponent.CurrentApp.ngOnInit();
                } else {
                    this.connecting = false;
                    alert('Wrong password!');
                }
            });
    }
}
