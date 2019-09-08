import { Component } from '@angular/core';
import { AuthApiService } from '../Services/AuthApiService';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AiurCollection } from '../Models/AiurCollection';
import { AiurProtocal } from '../Models/AiurProtocal';
import { catchError } from 'rxjs/operators';
import { InitService } from '../Services/InitService';
import { ApiService } from '../Services/ApiService';
import { ElectronService } from 'ngx-electron';
import { HomeService } from '../Services/HomeService';

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
        private authApiService: AuthApiService,
        private router: Router,
        private initService: InitService,
        public _electronService: ElectronService,
        private homeService: HomeService,
        ) {
        this.OAuthURL = ApiService.serverAddress;
        }

    public signin(): void {
        if (this.connecting) {
            return;
        }
        this.connecting = true;
        this.authApiService.AuthByPassword(this.email, this.password)
            .pipe(catchError(error => {
                this.connecting = false;
                Swal.fire('Network issue', 'Could not connect to Kahla server.', 'error');
                return Promise.reject(error.message || error);
            }))
            .subscribe(t => {
                if (t.code === 0) {
                    this.router.navigate(['/home'], {replaceUrl: true});
                    this.homeService.currentPage = 0;
                    this.initService.init();
                } else if (t.code === -10) {
                    Swal.fire('Sign in failed', (t as AiurProtocal as AiurCollection<string>).items[0], 'error');
                } else {
                    Swal.fire('Sign in failed', t.message, 'error');
                }
                this.connecting = false;
            });
    }
}
