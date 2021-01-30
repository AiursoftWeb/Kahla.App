import { Injectable } from '@angular/core';
import { ServerConfig } from '../Models/ServerConfig';
import { BrowserContextService } from '../Services/BrowserContextService';
import { LocalStoreService } from '../Services/LocalstoreService';
import { ServersRepo } from './ServersRepo';

@Injectable()
export class ServerManager {
    constructor(
        private localStore: LocalStoreService,
        private remoteServersRepo: ServersRepo,
        private browserContext: BrowserContextService) {

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
        this.getOurServer().then(() => { });
        while (!this.localStore.get(LocalStoreService.SERVER_CONFIG, ServerConfig).serverName) {
            // Hold it here.
        }
        return this.localStore.get(LocalStoreService.SERVER_CONFIG, ServerConfig);
    }

    /**
     * Get the first official suitable server for our current environment.
     */
    public async getDefaultServer(): Promise<ServerConfig> {
        let serverConfig: ServerConfig = null;
        const defaultServers = await this.remoteServersRepo.getRemoteServers();
        if (!defaultServers.length) {
            throw new Error('No server found from remote! Kahla will crash.');
        }
        if (!this.browserContext.domainLimited()) {
            serverConfig = defaultServers[0];
            console.log('Default server is just the first server because running in Electron.');
        } else {
            serverConfig = defaultServers.find(t => t.domain.client === window.location.origin);
            console.log(`Default server is ${serverConfig.domain.server}.`);
        }
        return serverConfig;
    }

    public async getOurServer(allowCache = true): Promise<ServerConfig> {
        let serverConfig = this.localStore.get(LocalStoreService.SERVER_CONFIG, ServerConfig);
        if (!allowCache) {
            serverConfig = await this.remoteServersRepo.fetchServer(serverConfig.domain.server);
        }
        if (!serverConfig.serverName) {
            console.warn('No server configured. Trying to select a default server...');
            serverConfig = await this.getDefaultServer();
        }
        this.localStore.replace(LocalStoreService.SERVER_CONFIG, serverConfig);
        return serverConfig;
    }

    public ourServerSet(): boolean {
        const serverConfig = this.localStore.get(LocalStoreService.SERVER_CONFIG, ServerConfig);
        return !!serverConfig.serverName;
    }

    private setOurServer(serverConfig: ServerConfig) {
        this.localStore.replace(LocalStoreService.SERVER_CONFIG, serverConfig);
    }

    public async connectAndSetOurServer(serverAddress: string): Promise<boolean> {
        try {
            const server = await this.remoteServersRepo.fetchServer(serverAddress);
            if (server.code !== 0 || server.domain.server !== serverAddress) {
                return false;
            }
            this.setOurServer(server);
            return true;
        } catch {
            return false;
        }
    }
}
