import { AiurProtocal } from './AiurProtocal';

export class Servers {
    public servers: ServerConfig[] = [];
}

export class ServerConfig extends AiurProtocal {
    public autoAcceptRequests: boolean;
    public apiVersion: string;
    public vapidPublicKey: string;
    public serverName: string;
    public mode: string;
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
