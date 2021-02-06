import { AiurProtocal } from './AiurProtocal';

export class ServerConfig extends AiurProtocal {
    public static readonly CACHE_VERSION = 1;

    public _cacheVersion: number;
    public autoAcceptRequests: boolean;
    public apiVersion: string;
    public vapidPublicKey: string;
    public serverName: string;
    public mode: string;
    public officialServer: boolean;
    public domain: {
        server: string,
        client: string,
    };
    public probe: {
        endpoint: string,
        openFormat: string,
        downloadFormat: string,
        playerFormat: string
    };
}
