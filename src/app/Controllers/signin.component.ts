import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { InitService } from '../Services/InitService';
import Swal from 'sweetalert2';
import { ServerManager } from '../Repos/ServerManager';
import { BrowserContextService } from '../Services/BrowserContextService';
import { ServerConfig } from '../Models/ServerConfig';
import { ServersRepo } from '../Repos/ServersRepo';

@Component({
    templateUrl: '../Views/signin.html',
    styleUrls: ['../Styles/signin.scss',
        '../Styles/button.scss']
})
export class SignInComponent implements OnInit {

    public viewingChangeServerPage = false;
    public serverAddress: string;
    public currentServer: ServerConfig;

    constructor(
        private browserContext: BrowserContextService,
        public electronService: ElectronService,
        public initService: InitService,
        private serverRepo: ServerManager,
        private serversRepo: ServersRepo) {
    }

    async ngOnInit(): Promise<void> {
        this.currentServer = await this.serverRepo.getOurServer();
        this.serverAddress = this.currentServer.domain.server;
    }

    public async resetServerAndBack(): Promise<void> {
        const defaultServer = await this.serverRepo.getDefaultServer();
        this.serverAddress = defaultServer.domain.server;
        await this.connectCommunity();
        this.viewingChangeServerPage = false;
    }

    public async connectCommunity(): Promise<void> {
        if (!this.serverAddress) {
            Swal.fire('Please input an valid server url!', '', 'error');
            return;
        }
        this.serverAddress = this.serverRepo.trimServerAddress(this.serverAddress);
        if (!this.serversRepo.isOfficialServer(this.serverAddress)) {
            const connectToUntrustServer = await Swal.fire({
                title: 'Connecting to a community server...',
                text: 'Aiursoft CANNOT prove the community server is secure.\n' +
                    ' You should NEVER connect to a server you don\'t trust.\n' +
                    'Chat data in community server will never be synced with one in official server.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Continue'
            });
            if (connectToUntrustServer.dismiss) {
                return;
            }
        }
        Swal.fire({
            title: 'Connecting...',
            showConfirmButton: false,
            showCancelButton: false
        });
        Swal.showLoading();
        const connected = await this.serverRepo.connectAndSetOurServer(this.serverAddress);
        Swal.close();
        if (connected) {
            await this.initService.init();
            this.viewingChangeServerPage = false;
        } else {
            this.fireFailed();
        }
    }

    private fireFailed() {
        Swal.close();
        Swal.fire('Failed to fetch manifest from server.', 'Check syntax, then contract the server\'s owner.', 'error');
    }

    public goLogin(url: string) {
        if (this.browserContext.isElectron()) {
            this.electronService.ipcRenderer.send('oauth', url);
        } else {
            document.location.href = url;
        }
    }
}
