import { AiurProtocal } from './AiurProtocal';

export class ServerConfig extends AiurProtocal {
    public serverUrl: string;
    public apiVersion: string;
    public vapidPublicKey: string;
    public serverName: string;
    public mode: string;
    public officialServer: boolean;
}
