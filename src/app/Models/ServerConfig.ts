import { AiurProtocal } from './AiurProtocal';

export class ServerConfig extends AiurProtocal {
    public static readonly CACHE_VERSION = 1;

    public _cacheVersion: number;
    public autoAcceptRequests: boolean;
    public apiVersion: string;
    public vapidPublicKey: string;
    public serverName: string;
    public mode: string;
    public probe: {
        endpoint: string,
        openPattern: string,
        downloadPattern: string,
        playerFormat: string
    };
}
