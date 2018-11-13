import { Injectable } from '@angular/core';
import { AES } from 'crypto-js';
import { FilesApiService } from './FilesApiService';
import Swal from 'sweetalert2';
import { UploadFile } from '../Models/UploadFile';
import { KahlaUser } from '../Models/KahlaUser';
import { ConversationApiService } from './ConversationApiService';

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    public static progress = 0;
    public static uploading = false;
    constructor(
        private filesApiService: FilesApiService,
        private conversationApiService: ConversationApiService
    ) {}

    public getProgress(): number {
        return UploadService.progress;
    }

    public getUploading(): boolean {
        return UploadService.uploading;
    }

    public upload(file: File, conversationID: number, aesKey: string, fileType: number): void {
        if (!this.validateFileSize(file)) {
            Swal('Error', 'File size should larger than or equal to one bit and less then or equal to 1000MB.', 'error');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        UploadService.uploading = true;
        if (fileType === 0 && !this.validImageType(file, false)) {
            Swal('Try again', 'Only support .png, .jpg, .jpeg, .svg, gif or .bmp file', 'error');
            return;
        }
        if (fileType === 0 || fileType === 1) {
            this.filesApiService.UploadMedia(formData).subscribe(response => {
                this.encryptThenSend(response, fileType, conversationID, aesKey);
            });
        } else {
            this.filesApiService.UploadFile(formData, conversationID).subscribe(response => {
                this.encryptThenSend(response, 2, conversationID, aesKey);
            });
        }
    }

    private encryptThenSend(response: number | UploadFile, fileType: number, conversationID: number, aesKey: string): void {
        let interval;
        if (Number(response)) {
            interval = setInterval(() => {
                if (<number>response > UploadService.progress) {
                    UploadService.progress = <number>response;
                }
            }, 100);
            if (<number>response === 100) {
                UploadService.progress = 100;
                clearInterval(interval);
            }
        } else if (response != null) {
            clearInterval(interval);
            if ((<UploadFile>response).code === 0) {
                let encedMessages;
                switch (fileType) {
                    case 0:
                        encedMessages = AES.encrypt(`[img]${(<UploadFile>response).fileKey}`, aesKey).toString();
                        break;
                    case 1:
                        encedMessages = AES.encrypt(`[video]${(<UploadFile>response).fileKey}`, aesKey).toString();
                        break;
                    case 2:
                        encedMessages = AES.encrypt(this.formateFileMessage(<UploadFile>response), aesKey).toString();
                        break;
                    default:
                        break;
                }
                this.conversationApiService.SendMessage(conversationID, encedMessages)
                    .subscribe(() => {
                        this.finishUpload();
                    });
            } else {
                Swal('Error', (<UploadFile>response).message, 'error');
                this.finishUpload();
            }
        }
    }

    private validateFileSize(file: File): boolean {
        if (file === null || file === undefined) {
            return false;
        }
        if (file.size >= 0.125 && file.size <= 1000000000) {
            return true;
        }
        return false;
    }

    private finishUpload() {
        UploadService.uploading = false;
        UploadService.progress = 0;
        this.scrollBottom(true);
    }

    public scrollBottom(smooth: boolean) {
        const images: NodeListOf<HTMLImageElement> = document.querySelectorAll('.chat-content img');
        const videos = document.querySelectorAll('video');
        let loaded = images.length + videos.length;
        if (loaded === 0) {
            this.scrollHelper(0, smooth);
            return;
        }
        for (let i = 0; i < images.length; i++) {
            if (images[i].complete) {
                loaded--;
            } else {
                images[i].addEventListener('load', () => {
                    loaded--;
                    this.scrollHelper(loaded, smooth);
                });
            }
        }
        for (let j = 0; j < videos.length; j++) {
            videos[j].addEventListener('loadeddata', () => {
                loaded--;
                this.scrollHelper(loaded, smooth);
            });
        }
        this.scrollHelper(loaded, smooth);
    }

    private scrollHelper(loaded: number, smooth: boolean): void {
        if (loaded === 0) {
            const h = document.documentElement.scrollHeight || document.body.scrollHeight;
            if (smooth) {
                window.scroll({top: h, behavior: 'smooth'});
            } else {
                window.scroll(0, h);
            }
        }
    }

    public uploadAvatar(user: KahlaUser, file: File): void {
        if (this.validImageType(file, true)) {
            const formData = new FormData();
            formData.append('image', file);
            UploadService.uploading = true;
            const uploadButton = document.querySelector('#upload');
            uploadButton.textContent = 'Uploading';
            this.filesApiService.UploadIcon(formData).subscribe(response => {
                if (Number(response)) {
                    UploadService.progress = <number>response;
                } else if (response != null && (<UploadFile>response).code === 0) {
                    UploadService.progress = 0;
                    user.headImgFileKey = (<UploadFile>response).fileKey;
                    user.avatarURL = (<UploadFile>response).downloadPath;
                    UploadService.uploading = false;
                    uploadButton.textContent = 'Upload new avatar';
                }
            });
        } else {
            Swal('Try again', 'Only support .png, .jpg, .jpeg or .bmp file', 'error');
        }
    }

    private validImageType(file: File, avatar: boolean): boolean {
        const validAvatarTypes = ['png', 'jpg', 'bmp', 'jpeg'];
        const validChatTypes = ['png', 'jpg', 'bmp', 'jpeg', 'gif', 'svg'];
        if (avatar) {
            for (const validType of validAvatarTypes) {
                if (file.name.substring(file.name.lastIndexOf('.') + 1) === validType) {
                    return true;
                }
            }
        } else {
            for (const validType of validChatTypes) {
                if (file.name.substring(file.name.lastIndexOf('.') + 1) === validType) {
                    return true;
                }
            }
        }
        return false;
    }

    public getFileKey(message: string): number {
        if (message === null || message.length < 5) {
            return -1;
        }
        if (message.startsWith('[img]')) {
            return Number(message.substring(5));
        } else if (message.startsWith('[file]')) {
            return Number(message.substring(6, message.indexOf('-')));
        } else if (message.startsWith('[video]')) {
            return Number(message.substring(7));
        } else {
            return -1;
        }
    }

    public getFileURL(event: MouseEvent, message: string): void {
        event.preventDefault();
        const filekey = this.getFileKey(message);
        if (filekey !== -1 && !isNaN(filekey) && filekey !== 0) {
            this.filesApiService.GetFileURL(filekey).subscribe(response => {
                if (response.code === 0) {
                    window.location.href = response.downloadPath;
                }
            });
        }
    }

    private formateFileMessage(response: UploadFile): string {
        let message = '[file]';
        const units = ['kB', 'MB', 'GB'];
        const thresh = 1000;
        message += response.fileKey + '-';
        message += response.savedFileName.replace(/-/g, '') + '-';
        if (response.fileSize < thresh) {
            message += response.fileSize + ' B';
        } else {
            let index = -1;
            do {
                response.fileSize /= thresh;
                index++;
            } while (response.fileSize >= thresh && index < units.length - 1);
            message += response.fileSize.toFixed(1) + ' ' + units[index];
        }
        return message;
    }
}
