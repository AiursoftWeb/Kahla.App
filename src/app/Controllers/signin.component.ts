import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ApiService } from '../Services/Api/ApiService';
import { InitService } from '../Services/InitService';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { ServerListApiService } from '../Services/Api/ServerListApiService';

@Component({
    templateUrl: '../Views/signin.html',
    styleUrls: ['../Styles/signin.scss',
        '../Styles/button.scss']
})
export class SignInComponent implements OnInit {

    public changingServer = false;
    public serverAddr;

    constructor(
        public _electronService: ElectronService,
        public apiService: ApiService,
        public serverListApiService: ServerListApiService,
        public initService: InitService,
        public http: HttpClient,
    ) {
    }

    public clearCommunityServerData() {
        localStorage.removeItem('serverConfig');
        this.changingServer = false;
        this.initService.init();
    }

    public connectCommunity() {
        if (!this.serverAddr) {
            Swal.fire('Please input an valid server url!', '', 'error');
            return;
        }
        if (!this.serverAddr.match(/^https?:\/\/.+/g)) {
            this.serverAddr = 'https://' + this.serverAddr;
        }
        Swal.fire({
            icon: 'info',
            title: 'Fetching manifest from your community server...',
            text: this.serverAddr,
            showConfirmButton: false,
            showCancelButton: false
        });
        Swal.showLoading();
        const fireFailed = () => Swal.fire('Failed to fetch manifest from server.', 'Check syntax, then contract the server\'s owner.', 'error');
        this.serverListApiService.getServerConfig(this.serverAddr).subscribe({
            next: serverConfig => {
                if (serverConfig.code !== 0 || serverConfig.domain.server !== this.serverAddr) {
                    Swal.close();
                    fireFailed();
                    return;
                }
                this.serverListApiService.Servers().subscribe(officialServer => {
                    Swal.close();
                    const last = () => {
                        localStorage.setItem('serverConfig', JSON.stringify(serverConfig));
                        this.changingServer = false;
                        this.initService.init();
                    };
                    if (officialServer.map(t => t.domain.server).includes(serverConfig.domain.server)) {
                        // an official server
                        serverConfig.officialServer = true;
                        last();
                    } else {
                        Swal.fire({
                            title: 'Connecting to a community server...',
                            text: 'Aiursoft CANNOT prove the community server is secure.\n' +
                                ' You should NEVER connect to a server you don\'t trust.\n' +
                                'Chat data in community server will never be synced with one in official server.',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'Continue'
                        }).then(res => {
                            if (res.dismiss) {
                                return;
                            }
                            serverConfig.officialServer = false;
                            last();
                        });
                    }
                });
            },
            error: _t => fireFailed()
        });
    }

    ngOnInit(): void {
        if (this.apiService.serverConfig && !this.apiService.serverConfig.officialServer) {
            this.serverAddr = this.apiService.serverConfig.domain.server;
        }
    }

    public goLogin(url: string) {
        if (this._electronService.isElectronApp) {
            this._electronService.ipcRenderer.send('oauth', url);
        } else {
            document.location.href = url;
        }
    }
}
