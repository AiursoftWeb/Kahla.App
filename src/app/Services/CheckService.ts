import { Injectable } from '@angular/core';
import { AuthApiService } from './AuthApiService';
import Swal from 'sweetalert2';
import { versions } from '../../environments/versions';
import { ElectronService } from 'ngx-electron';
import { ApiService } from './ApiService';

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
        private _electronService: ElectronService,
        private apiService: ApiService
    ) {
        if (this.checkSwCache()) {
            navigator.serviceWorker.addEventListener('message', (t: MessageEvent) => {
                if (t.data === '__Update_Completed__') {
                    Swal.fire({
                        title: 'Update Completed',
                        html: 'Refresh to apply your upgrade.<br/>Do you want to refresh now?',
                        icon: 'success',
                        showConfirmButton: true,
                        confirmButtonText: 'Refresh',
                        showCancelButton: true,
                        cancelButtonText: 'Later'
                    }).then(t_ => {
                        if (t_.value) {
                            document.location.reload();
                        }
                    });
                }
            });
        }
    }

    public checkVersion(showAlert: boolean): void {
        this.checking = true;
        this.authApiService.Version()
            .subscribe(t => {
                const latestVersion: Array<string> = t.latestVersion.split('.');
                const latestAPIVersion: Array<string> = t.apiVersion.split('.');
                const currentVersion: Array<string> = versions.version.split('.');
                const downloadAddress: string = t.downloadAddress;
                if (latestVersion[0] > currentVersion[0] ||
                    latestVersion[1] > currentVersion[1] ||
                    latestVersion[2] > currentVersion[2]) {
                    this.redirectToDownload(downloadAddress, showAlert);
                } else if (
                    latestAPIVersion[0] > currentVersion[0] ||
                    latestAPIVersion[1] > currentVersion[1]) {
                    Swal.fire('API version mismatch', 'API level is too far from client! You have to upgrade now!', 'warning');
                    this.redirectToDownload(downloadAddress, true);
                } else if ((latestVersion[0] < currentVersion[0] ||
                    latestVersion[1] < currentVersion[1] ||
                    latestVersion[2] < currentVersion[2]) &&
                    !this.apiService.serverConfig.officialServer) {
                    Swal.fire('Community server outdated!', 'The Client version is newer then the Server version.\n' +
                        'Consider contact the host of the server for updating the kahla.server version to latest.', 'warning');
                } else if (showAlert) {
                    Swal.fire('Success', 'You are running the latest version of Kahla!', 'success');
                }
                this.checking = false;
            });
    }

    private redirectToDownload(downloadAddress: string, showAlert: boolean = false): void {
        if (this._electronService.isElectronApp) {
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
        } else if (this.checkSwCache()) {
            this.updateServiceWorkerCache();
            if (showAlert) {
                Swal.fire({
                    title: 'There is a new version of Kahla!',
                    text: 'We are upgrading automatically at the background.\n You will be notified when done.',
                    icon: 'warning'
                });
            }

        } else {
            // in a browser without serviceworker
            Swal.fire({
                title: 'There is a new version of Kahla!',
                text: 'Please refresh(Ctrl + F5) or reopen this page to use the latest version.',
                icon: 'warning'
            });
        }
    }

    public updateServiceWorkerCache() {
        navigator.serviceWorker.controller.postMessage('__Update_Required__');
    }

    public checkSwCache(): boolean {
        return !this._electronService.isElectronApp && 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;
    }

    public openWebPage(url: string): void {
        if (this._electronService.isElectronApp) {
            this._electronService.shell.openExternal(url);
        } else {
            location.href = url;
        }
    }
}
