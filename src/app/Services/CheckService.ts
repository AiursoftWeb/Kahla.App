import { Injectable } from '@angular/core';
import { AuthApiService } from './AuthApiService';
import Swal from 'sweetalert2';
import { versions } from '../../environments/versions';
import { ElectronService } from 'ngx-electron';

@Injectable({
    providedIn: 'root'
})

export class CheckService {
    public checking = false;
    public version = versions.version;
    public revision = versions.revision;
    public buildTime = versions.buildTime;

    constructor(
        private authApiService: AuthApiService,
        private _electronService: ElectronService
    ) {}

    public checkVersion(checkButton: boolean): void {
        this.checking = true;
        this.authApiService.Version()
            .subscribe(t => {
                const latestVersion: Array<string> = t.latestVersion.split('.');
                const currentVersion: Array<string> = versions.version.split('.');
                const downloadAddress: string = t.downloadAddress;
                if (latestVersion[0] > currentVersion[0]) {
                    this.redirectToDownload(downloadAddress);
                } else if (latestVersion[0] === currentVersion[0] && latestVersion[1] > currentVersion[1]) {
                    this.redirectToDownload(downloadAddress);
                } else if (latestVersion[0] === currentVersion[0] && latestVersion[1] === currentVersion[1]
                    && latestVersion[2] > currentVersion[2]) {
                    this.redirectToDownload(downloadAddress);
                } else if (checkButton) {
                    Swal.fire('Success', 'You are running the latest version of Kahla!', 'success');
                }
                this.checking = false;
            });
    }

    private redirectToDownload(downloadAddress: string): void {
        if (window.hasOwnProperty('cordova') || this._electronService.isElectronApp) {
            Swal.fire({
                title: 'There is a new version of Kahla!',
                text: 'Do you want to download the latest version of Kahla now?',
                icon: 'warning',
                confirmButtonText: 'Download now',
                cancelButtonText: 'Remind me later',
                showCancelButton: true
            }).then(ToDownload => {
                if (ToDownload.value) {
                    this.openWebPage(downloadAddress);
                }
            });
        } else {
            // in a browser
            Swal.fire({
                title: 'There is a new version of Kahla!',
                text: 'Please refresh then reopen the page to use the latest version.',
                icon: 'warning'
            });
        }
    }

    public openWebPage(url: string): void {
        if (this._electronService.isElectronApp) {
            this._electronService.shell.openExternal(url);
        } else {
            location.href = url;
        }
    }
}
