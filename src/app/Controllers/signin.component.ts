import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ApiService } from '../Services/ApiService';
import { InitService } from '../Services/InitService';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { ServerConfig } from '../Models/ServerConfig';

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
        this.http.get<ServerConfig>(this.serverAddr).subscribe({
            next: t => {
                Swal.close();
                if (t.code !== 0) {
                    this.fireFailed();
                    return;
                }
                t.officialServer = false;
                t.serverUrl = this.serverAddr;
                localStorage.setItem('serverConfig', JSON.stringify(t));
                this.changingServer = false;
                this.initService.init();
            },
            error: _t => this.fireFailed()
        });
    }

    fireFailed() {
        Swal.fire('Failed to fetch manifest from server.', 'Check syntax, then contract the server\'s owner.', 'error');
    }

    ngOnInit(): void {
    }
}
