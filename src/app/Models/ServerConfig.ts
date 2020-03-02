import { AiurProtocal } from './AiurProtocal';

export class ServerConfig extends AiurProtocal {
    public apiVersion: string;
    public vapidPublicKey: string;
    public serverName: string;
    public mode: string;
    public officialServer: boolean;
    public domain: {
        server: string,
        client: string,
    };
}
