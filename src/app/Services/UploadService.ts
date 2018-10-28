import { Injectable } from '@angular/core';
import { AES } from 'crypto-js';
import { ApiService } from './ApiService';
import Swal from 'sweetalert2';
import { UploadFile } from '../Models/UploadFile';
import { KahlaUser } from '../Models/KahlaUser';

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    public progress = 0;
    public uploading = false;
    constructor(
        private apiService: ApiService
    ) {}

    public upload(file: File, conversationID: number, aesKey: string): void {
        const formData = new FormData();
        formData.append('file', file);
        this.uploading = true;
        this.apiService.UploadFile(formData, conversationID).subscribe(response => {
            if (Number(response)) {
                this.progress = <number>response;
            } else if (response != null) {
                let encedMessages;
                switch (this.getFileType(file)) {
                    case 0:
                        encedMessages = AES.encrypt(`[img]${(<UploadFile>response).fileKey}`, aesKey).toString();
                        break;
                    case 1:
                        encedMessages = AES.encrypt(`[video]${(<UploadFile>response).fileKey}`, aesKey).toString();
                        break;
                    case 2:
                        encedMessages = AES.encrypt(`[file]${(<UploadFile>response).fileKey}`, aesKey).toString();
                        break;
                    default:
                        break;
                }
                this.apiService.SendMessage(conversationID, encedMessages)
                    .subscribe(() => {
                        this.finishUpload();
                    });
            }
        });
    }

    private getFileType(file: Blob): number {
        if (file == null) {
            return -1;
        }
        if (file.type.match('^image')) {
            return 0;
        } else if (file.type.match('^video')) {
            return 1;
        } else {
            return 2;
        }
    }

    private finishUpload() {
        this.uploading = false;
        this.progress = 0;
        this.scrollBottom(true);
    }

    public scrollBottom(smooth: boolean) {
        const h = document.documentElement.scrollHeight || document.body.scrollHeight;
        if (smooth) {
            window.scroll({top: h, behavior: 'smooth'});
        } else {
            window.scroll(0, h);
        }
    }

    public uploadAvatar(user: KahlaUser, file: File): void {
        if (this.validImageType(file)) {
            const formData = new FormData();
            formData.append('image', file);
            this.uploading = true;
            const uploadButton = document.querySelector('#upload');
            uploadButton.textContent = 'Uploading';
            if (user === null) {} // delete
            // this.apiService.UploadFile(formData).subscribe(response => {
            //     if (Number(response)) {
            //         this.progress = <number>response;
            //     } else if (response != null) {
            //         this.progress = 0;
            //         user.headImgFileKey = (<UploadFile>response).fileKey;
            //         user.avatarURL = (<UploadFile>response).path;
            //         this.uploading = false;
            //         uploadButton.textContent = 'Upload new avatar';
            //     }
            // });
        } else {
            Swal('Try again', 'Only support .png, .jpg or .bmp file', 'error');
        }
    }

    private validImageType(file: File): boolean {
        const validImageTypes = ['png', 'jpg', 'bmp'];
        for (const validType of validImageTypes) {
          if (file.name.substring(file.name.lastIndexOf('.') + 1) === validType) {
            return true;
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
            return Number(message.substring(6));
        } else if (message.startsWith('[video]')) {
            return Number(message.substring(7));
        } else {
            return -1;
        }
    }
}
