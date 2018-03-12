import { AiurProtocal } from './AiurProtocal';

export class VersionViewModel extends AiurProtocal {
    public latestVersion: string;
    public oldestSupportedVersion: string;
    public downloadAddress: string;
}
