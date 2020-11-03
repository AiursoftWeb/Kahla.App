import { Injectable } from '@angular/core';
import { ServerConfig, Servers } from '../Models/ServerConfig';
import { ServerListApiService } from '../Services/Api/ServerListApiService';
import { LocalStoreService } from '../Services/LocalstoreService';

@Injectable()
export class ServersRepo {
    constructor(
        private localStore: LocalStoreService,
        private serversApi: ServerListApiService) {
    }

    private async pullRemoteServers(): Promise<ServerConfig[]> {
        const remoteServers = await this.serversApi.Servers();
        this.localStore.replace<Servers>(LocalStoreService.SERVERS_STORE, { servers: remoteServers });
        return remoteServers;
    }

    public async getRemoteServers(allowCache = true): Promise<ServerConfig[]> {
        let servers = this.localStore.get(LocalStoreService.SERVERS_STORE, Servers).servers;
        if (!servers.length || !allowCache) {
            servers = await this.pullRemoteServers();
        }
        return servers;
    }

    public async isOfficialServer(inputServer: string): Promise<boolean> {
        const officialServer = await this.getRemoteServers();
        return officialServer.some(t => t.domain.server === inputServer);
    }

    public async getServer(inputAddress: string, allowCache = true): Promise<ServerConfig> {
        const servers = await this.getRemoteServers();
        const cached = servers.find(t => t.domain.server === inputAddress);
        if (cached && allowCache) {
            return cached;
        }
        return await this.serversApi.getServerConfig(inputAddress);
    }
}
