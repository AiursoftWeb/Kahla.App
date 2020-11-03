import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { KahlaHTTP } from '../Services/Api/KahlaHTTP';
import { InitService } from '../Services/InitService';
import Swal from 'sweetalert2';
import { LocalStoreService } from '../Services/LocalstoreService';
import { ServersRepo } from '../Repos/ServersRepo';
import { ServerRepo } from '../Repos/ServerRepo';
import { Toolbox } from '../Services/Toolbox';
import { BrowserContextService } from '../Services/BrowserContextService';

@Component({
    templateUrl: '../Views/signin.html',
    styleUrls: ['../Styles/signin.scss',
        '../Styles/button.scss']
})
export class SignInComponent implements OnInit {

    public changingServer = false;
    public serverAddr: string;

    constructor(
        private browserContext: BrowserContextService,
        public electronService: ElectronService,
        public apiService: KahlaHTTP,
        public initService: InitService,
        private localstore: LocalStoreService,
        private remoteServersRepo: ServersRepo,
        private serverRepo: ServerRepo) {
    }

    async ngOnInit(): Promise<void> {
        const ourServer = await this.serverRepo.getOurServer();
        this.serverAddr = ourServer.domain.server;
    }

    public async clearCommunityServerData(): Promise<void> {
        this.localstore.reset(LocalStoreService.SERVER_CONFIG);
        this.changingServer = false;
        await this.initService.init();
    }

    public async connectCommunity(): Promise<void> {
        if (!this.serverAddr) {
            Swal.fire('Please input an valid server url!', '', 'error');
            return;
        }
        this.serverAddr = Toolbox.trim(this.serverAddr, '/').toLowerCase();
        if (!this.serverAddr.match(/^https?:\/\/.+/g)) {
            this.serverAddr = 'https://' + this.serverAddr;
        }
        Swal.fire({
            icon: 'info',
            title: 'Fetching manifest from server...',
            text: this.serverAddr,
            showConfirmButton: false,
            showCancelButton: false
        });
        Swal.showLoading();
        try {
            const serverConfig = await this.remoteServersRepo.getServer(this.serverAddr);
            if (serverConfig.code !== 0 || serverConfig.domain.server !== this.serverAddr) {
                this.fireFailed();
                return;
            }
            Swal.close();
            const res = await Swal.fire({
                title: 'Connecting to a community server...',
                text: 'Aiursoft CANNOT prove the community server is secure.\n' +
                    ' You should NEVER connect to a server you don\'t trust.\n' +
                    'Chat data in community server will never be synced with one in official server.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Continue'
            });
            if (res.dismiss) {
                return;
            }
            this.serverRepo.setOurServer(serverConfig);
            this.changingServer = false;
            await this.initService.init();
        } catch {
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
