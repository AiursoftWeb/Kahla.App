import { AiurProtocol } from './AiurProtocal';

export interface ServerConfig extends AiurProtocol {
    // public static readonly CACHE_VERSION = 1;

    // _cacheVersion: number;
    autoAcceptRequests: boolean;
    apiVersion: string;
    vapidPublicKey: string;
    serverName: string;
    mode: string;
    probe: {
        endpoint: string;
        openPattern: string;
        downloadPattern: string;
        playerFormat: string;
    };
}
