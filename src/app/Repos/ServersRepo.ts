import { Injectable } from '@angular/core';
import { ServerConfig, Servers } from '../Models/ServerConfig';
import { ServerListApiService } from '../Services/Api/ServerListApiService';
import { BrowserContextService } from '../Services/BrowserContextService';
import { LocalStoreService } from '../Services/LocalstoreService';

@Injectable()
export class ServersRepo {
    constructor(
        private localStore: LocalStoreService,
        private serversApi: ServerListApiService,
        private browserContext: BrowserContextService) {
    }

    private async fetchRemoteServers(): Promise<ServerConfig[]> {
        const remoteServers = await this.serversApi.Servers();
        this.localStore.replace<Servers>(LocalStoreService.SERVERS_STORE, { servers: remoteServers });
        return remoteServers;
    }

    public async getRemoteServers(allowCache = true, onlySuitable = false): Promise<ServerConfig[]> {
        let servers = this.localStore.get(LocalStoreService.SERVERS_STORE, Servers).servers;
        if (!servers.length || !allowCache) {
            servers = await this.fetchRemoteServers();
        }
        if (onlySuitable && this.browserContext.domainLimited()) {
            servers = servers.filter(t => t.domain.client === window.location.origin);
        }
        return servers;
    }

    public async isOfficialServer(inputServer: string): Promise<boolean> {
        const officialServer = await this.getRemoteServers();
        return officialServer.some(t => t.domain.server === inputServer);
    }

    public fetchServer(inputAddress: string): Promise<ServerConfig> {
        return this.serversApi.getServerConfig(inputAddress);
    }
}
