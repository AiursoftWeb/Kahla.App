import { AiurProtocal } from './AiurProtocal';

export interface VersionViewModel extends AiurProtocal {
    latestVersion: string;
    downloadAddress: string;
}
