import { Component, OnInit } from '@angular/core';
import { AuthApiService } from '../Services/Api/AuthApiService';
import { Router } from '@angular/router';
import { Values } from '../values';
import { InitService } from '../Services/InitService';
import Swal from 'sweetalert2';
import { CacheService } from '../Services/CacheService';
import { HomeService } from '../Services/HomeService';
import { lastValueFrom } from 'rxjs';
import { showCommonErrorDialog } from '../Utils/CommonErrorDialog';
import { WebpushService } from '../Services/WebpushService';

@Component({
    selector: 'app-settings',
    templateUrl: '../Views/settings.html',
    styleUrls: [
        '../Styles/menu.scss',
        '../Styles/reddot.scss',
        '../Styles/button.scss',
        '../Styles/badge.scss',
    ],
    standalone: false,
})
export class SettingsComponent {
    public loadingImgURL = Values.loadingImgURL;
    constructor(
        private authApiService: AuthApiService,
        private webpushService: WebpushService,
        private router: Router,
        private initSerivce: InitService,
        public cacheService: CacheService,
        public homeService: HomeService
    ) {}

    public pwaAddHomeScreen(): void {
        this.homeService.pwaHomeScreenPrompt.prompt();
        this.homeService.pwaHomeScreenPrompt.userChoice.then(choiceResult => {
            if (choiceResult.outcome === 'accepted') {
                this.homeService.pwaHomeScreenSuccess = true;
            }
            this.homeService.pwaHomeScreenPrompt = null;
        });
    }

    public async SignOut() {
        const willSignOut = await Swal.fire({
            title: 'Are you sure to sign out?',
            icon: 'warning',
            showCancelButton: true,
        });

        if (!willSignOut.value) return;

        try {
            await lastValueFrom(
                this.authApiService.Signout(this.webpushService.pushSettings.deviceId)
            );
        } catch (err) {
            showCommonErrorDialog(err);
            return;
        }

        this.initSerivce.destroy();
        this.router.navigate(['/signin'], { replaceUrl: true });
        this.webpushService.unsubscribeUser();
    }

    public sendEmail(): void {
        this.authApiService.Me().subscribe(p => {
            if (p.code === 0) {
                this.cacheService.mine().me.emailConfirmed = p.user.emailConfirmed;
                if (!this.cacheService.mine().me.emailConfirmed) {
                    Swal.fire({
                        title: 'Please verify your email.',
                        text: "Please confirm your email as soon as possible! Or you may lose access \
                            to your account in a few days! Without confirming your email, you won't receive \
                            any important notifications and cannot reset your password!",
                        icon: 'warning',
                        confirmButtonText: 'Send Email',
                        showCancelButton: true,
                    }).then(sendEmail => {
                        if (sendEmail.value && this.cacheService.mine().me) {
                            this.authApiService
                                .SendMail(this.cacheService.mine().me.email)
                                .subscribe(result => {
                                    if (result.code === 0) {
                                        Swal.fire({
                                            title: 'Please check your inbox.',
                                            text:
                                                'Email was send to ' +
                                                this.cacheService.mine().me.email,
                                            icon: 'success',
                                        });
                                    } else {
                                        Swal.fire({
                                            title: 'Error',
                                            text: result.message,
                                            icon: 'error',
                                        });
                                    }
                                });
                        }
                    });
                }
            }
        });
    }
}
