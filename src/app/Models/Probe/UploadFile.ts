import { AiurProtocol } from '../AiurProtocal';

export interface UploadFile extends AiurProtocol {
    filePath: string;
    fileSize: number;
}
