import { Component } from '@angular/core';
import { AuthApiService } from '../Services/Api/AuthApiService';
import Swal from 'sweetalert2';

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

    public async onSubmit(): Promise<void> {
        this.checkValid();
        if (!this.samePassword) {
            Swal.fire('Passwords are not same!', 'error');
            return;
        }
        if (!this.valid) {
            Swal.fire('Password length should between 6 and 32.');
            return;
        }

        try {
            const changeResult = await this.authApiServer.ChangePassword(this.oldPassword, this.newPassword, this.confirmPassword);
            if (changeResult.code === 0) {
                Swal.fire('All set', changeResult.message, 'success');
            } else {
                Swal.fire('Try again', changeResult.message, 'error');
            }
        } catch {
            Swal.fire('Network issue', 'Could not connect to Kahla server.', 'error');
        }
    }
}
