import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { versions } from '../../environments/versions';
import { ElectronService } from 'ngx-electron';
import { ServerListApiService } from './Api/ServerListApiService';
import { ApiService } from './Api/ApiService';

@Injectable({
    providedIn: 'root'
})

export class CheckService {
    public checking = false;
    public version = versions.version;
    public revision = versions.revision;
    public buildTime = versions.buildTime;

    constructor(
        private _electronService: ElectronService,
        private serverListApiService: ServerListApiService,
        private apiService: ApiService,
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
        this.serverListApiService.Version()
            .subscribe(t => {
                if (this.compareVersion(t.latestVersion, versions.version) > 0) {
                    this.redirectToDownload(t.downloadAddress, showAlert);
                } else if (showAlert) {
                    Swal.fire('Success', 'You are running the latest version of Kahla!', 'success');
                }
                this.checking = false;
            });
    }

    public checkApiVersion(): void {
        this.serverListApiService.getServerConfig(this.apiService.serverConfig.domain.server).subscribe(t => {
            const delta = this.compareVersion(t.apiVersion, versions.version);
            if (delta === 1 || delta === 2) {
                Swal.fire('Outdated client.', 'Your Kahla App is too far from the version of the server connected.\n' +
                    'Kahla might not work properly if you don\'t upgrade.', 'warning');
            } else if (delta < 0 && !this.apiService.serverConfig.officialServer) {
                Swal.fire('Community server outdated!', 'The Client version is newer then the Server version.\n' +
                    'Consider contact the host of the server for updating the kahla.server version to latest.', 'warning');
            }
        });
    }

    public compareVersion(a: string, b: string): number {
        const verA = a.split('.').map(Number);
        const verB = b.split('.').map(Number);

        for (let i = 0; i < 3; i++) {
            if (verA[i] === verB[i]) {
                continue;
            }
            return Math.sign(verA[i] - verB[i]) * (i + 1);
        }
        return 0;
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
