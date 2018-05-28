import { Component } from '@angular/core';
import { ApiService } from '../Services/ApiService';
import { AppComponent } from './app.component';
import { Router } from '@angular/router';
import 'sweetalert';
import { AiurCollection } from '../Models/AiurCollection';
import { catchError } from 'rxjs/operators';

@Component({
    templateUrl: '../Views/register.html',
    styleUrls: ['../Styles/signin.css']
})
export class RegisterComponent {
    public email = '';
    public password = '';
    public confirmPassword = '';
    public connecting = false;

    constructor(
        private apiService: ApiService,
        private router: Router) { }

    public register(): void {
        if (this.connecting) {
            return;
        }
        this.connecting = true;
        this.apiService.RegisterKahla(this.email, this.password, this.confirmPassword)
            .pipe(catchError(error=>{
                this.connecting = false;
                swal('Network issue', 'Could not connect to Kahla server.', 'error');
                return Promise.reject(error.message || error);
            }))
            .subscribe(t => {
                if (t.code === 0) {
                    this.apiService.AuthByPassword(this.email, this.password)
                        .subscribe(p => {
                            if (p.code === 0) {
                                this.router.navigate(['/kahla/conversations']);
                                AppComponent.CurrentApp.ngOnInit();
                            } else {
                                swal('Sign in failed', 'An error occured while signing in.', 'error');
                            }
                        });
                } else if (t.code === -10) {
                    swal('Sign in failed', (t as AiurCollection<string>).items[0], 'error');
                } else {
                    swal('Sign in failed', t.message, 'error');
                }
                this.connecting = false;
            });
    }
}
