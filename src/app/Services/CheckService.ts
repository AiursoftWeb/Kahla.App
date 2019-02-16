import { Injectable } from '@angular/core';
import { AuthApiService } from './AuthApiService';
import Swal from 'sweetalert2';
import { versions } from '../../environments/versions';

@Injectable({
    providedIn: 'root'
})

export class CheckService {
    public checking = false;
    public version = versions.version;
    public revision = versions.revision;
    public buildTime = versions.buildTime;

    constructor(
        private authApiService: AuthApiService
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
        Swal.fire({
            title: 'There is a new version of Kahla!',
            text: 'Do you want to download the latest version of Kahla now?',
            type: 'warning',
            confirmButtonText: 'Download now',
            showCancelButton: true
        }).then(ToDownload => {
            if (ToDownload.value) {
                location.href = downloadAddress;
            }
        });
    }
}
