import { Component, OnInit } from '@angular/core';
import { CheckService } from '../Services/CheckService';
import { Values } from '../values';
import { environment } from '../../environments/environment';
import { BrowserContextService } from '../Services/BrowserContextService';
import { ServerManager } from '../Repos/ServerManager';
import { ServerConfig } from '../Models/ServerConfig';

@Component({
    templateUrl: '../Views/about.html',
    styleUrls: [
        '../Styles/about.scss',
        '../Styles/menu.scss',
        '../Styles/button.scss']
})

export class AboutComponent implements OnInit {
    public sourceCodeURL = Values.sourceCodeURL;
    public website = environment.serversProvider;
    public currentServer: ServerConfig;

    constructor(
        public checkService: CheckService,
        public browserContext: BrowserContextService,
        public serverRepo: ServerManager
    ) {
    }

    async ngOnInit(): Promise<void> {
        this.currentServer = await this.serverRepo.getOurServer();
    }

    public async check(): Promise<void> {
        await this.checkService.checkAndAlertAppVersion(true);
    }

    public getCurrentYear(): number {
        return new Date().getFullYear();
    }
}
