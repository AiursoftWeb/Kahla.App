import { AiurProtocol } from '../AiurProtocal';

export interface ForwardMediaApiModel extends AiurProtocol {
    siteName: string;
    filePath: string;
    internetPath: string;
    fileSize: string;
}
