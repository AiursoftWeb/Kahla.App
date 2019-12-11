import { AiurProtocal } from './AiurProtocal';

export class VersionViewModel extends AiurProtocal {
    public latestVersion: string;
    public oldestSupportedVersion: string;
    public apiVersion: string;
    public downloadAddress: string;
}
