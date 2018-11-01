import { AiurProtocal } from './AiurProtocal';

export class UploadFile extends AiurProtocal {
    public savedFileName: string;
    public fileKey: number;
    public fileSize: number;
    public downloadPath: string;
}
