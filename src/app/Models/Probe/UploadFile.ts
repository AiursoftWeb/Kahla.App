import { AiurProtocal } from '../AiurProtocal';

export interface UploadFile extends AiurProtocal {
    filePath: string;
    fileSize: number;
}
