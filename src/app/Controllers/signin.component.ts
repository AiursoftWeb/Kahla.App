import { Component } from '@angular/core';
import { ApiService } from '../Services/ApiService';
import { ElectronService } from 'ngx-electron';

@Component({
    templateUrl: '../Views/signin.html',
    styleUrls: ['../Styles/signin.scss',
                '../Styles/button.scss']
})
export class SignInComponent {
    public email: string;
    public password: string;
    public connecting = false;
    public OAuthURL: string;

    constructor(
        public _electronService: ElectronService,
        ) {
        this.OAuthURL = ApiService.serverAddress;
        }
}
