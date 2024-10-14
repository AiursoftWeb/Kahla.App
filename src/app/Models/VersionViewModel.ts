import { AiurProtocol } from './AiurProtocal';

export interface VersionViewModel extends AiurProtocol {
    latestVersion: string;
    downloadAddress: string;
}
