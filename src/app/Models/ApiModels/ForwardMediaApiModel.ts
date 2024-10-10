import { AiurProtocal } from '../AiurProtocal';

export interface ForwardMediaApiModel extends AiurProtocal {
    siteName: string;
    filePath: string;
    internetPath: string;
    fileSize: string;
}
