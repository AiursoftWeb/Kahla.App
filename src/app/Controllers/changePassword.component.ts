import { Component } from '@angular/core';
import { AuthApiService } from '../Services/AuthApiService';
import Swal from 'sweetalert2';
import { catchError } from 'rxjs/operators';

@Component({
    templateUrl: '../Views/changePassword.html',
    styleUrls: [
        '../Styles/userDetail.scss',
        '../Styles/button.scss'
    ]
})
export class ChangePasswordComponent {
    public oldPassword = '';
    public newPassword = '';
    public confirmPassword = '';
    public samePassword = false;
    private valid = false;

    constructor(
        private authApiServer: AuthApiService,
    ) {
    }

    public checkValid(): void {
        this.samePassword = this.newPassword === this.confirmPassword;
        if (/^.{6,32}$/.test(this.oldPassword) && /^.{6,32}$/.test(this.newPassword)) {
            this.valid = true;
        }
    }

    public onSubmit(): void {
        this.checkValid();
        if (!this.samePassword) {
            Swal.fire('Passwords are not same!', 'error');
            return;
        }
        if (!this.valid) {
            Swal.fire('Password length should between 6 and 32.');
            return;
        }
        this.authApiServer.ChangePassword(this.oldPassword, this.newPassword, this.confirmPassword)
            .pipe(catchError(error => {
                Swal.fire('Network issue', 'Could not connect to Kahla server.', 'error');
                return Promise.reject(error.message || error);
            }))
            .subscribe(result => {
                if (result.code === 0) {
                    Swal.fire('All set', result.message, 'success');
                } else {
                    Swal.fire('Try again', result.message, 'error');
                }
            });
    }
}
