import { Injectable } from '@angular/core';
import { ServerConfig } from '../Models/ServerConfig';
import { LocalStoreService } from '../Services/LocalstoreService';
import { ServersRepo } from './ServersRepo';

@Injectable()
export class ServerRepo {
    constructor(
        private localStore: LocalStoreService,
        private remoteServersRepo: ServersRepo) {

    }

    /**
     * This method is only for sync method. Will be replaced with the async one: `getOurServer`
     */
    public getOurServerSync(): ServerConfig {
        const savedServer = this.localStore.get(LocalStoreService.SERVER_CONFIG, ServerConfig);
        if (savedServer) {
            return savedServer;
        }
        console.warn('Trying to get a server config with no server saved. Will wait till all servers loaded.');
        this.getOurServer(true).then(() => { });
        while (!this.localStore.get(LocalStoreService.SERVER_CONFIG, ServerConfig)) {
            // Hold it here.
        }
        return this.localStore.get(LocalStoreService.SERVER_CONFIG, ServerConfig);
    }

    public async getOurServer(allowCache = true): Promise<ServerConfig> {
        let serverConfig = this.localStore.get(LocalStoreService.SERVER_CONFIG, ServerConfig);
        if (!serverConfig.serverName) {
            console.warn('No server configured. Trying to select a default server...');
            const defaultServers = await this.remoteServersRepo.getRemoteServers();
            if (!defaultServers.length) {
                throw new Error('No server found from remote! Kahla will crash.');
            }
            serverConfig = defaultServers[0];
        }
        if (!allowCache) {
            serverConfig = await this.remoteServersRepo.getServer(serverConfig.domain.server, false);
        }
        this.localStore.replace(LocalStoreService.SERVER_CONFIG, serverConfig);
        return serverConfig;
    }

    public ourServerSet(): boolean {
        const serverConfig = this.localStore.get(LocalStoreService.SERVER_CONFIG, ServerConfig);
        return !!serverConfig.serverName;
    }

    public setOurServer(serverConfig: ServerConfig) {
        this.localStore.replace(LocalStoreService.SERVER_CONFIG, serverConfig);
    }
}