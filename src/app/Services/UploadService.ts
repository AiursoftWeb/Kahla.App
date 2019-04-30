import { Injectable } from '@angular/core';
import { AES } from 'crypto-js';
import { FilesApiService } from './FilesApiService';
import Swal from 'sweetalert2';
import { UploadFile } from '../Models/UploadFile';
import { KahlaUser } from '../Models/KahlaUser';
import { ConversationApiService } from './ConversationApiService';
import * as loadImage from 'blueimp-load-image';

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    public progress = 0;
    public uploading = false;
    public talkingDestroyed = false;
    constructor(
        private filesApiService: FilesApiService,
        private conversationApiService: ConversationApiService
    ) {}

    public upload(file: File, conversationID: number, aesKey: string, fileType: number): void {
        if (!this.validateFileSize(file)) {
            Swal.fire('Error', 'File size should larger than or equal to one bit and less then or equal to 1000MB.', 'error');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        if (fileType === 0 && !this.validImageType(file, false)) {
            Swal.fire('Try again', 'Only support .png, .jpg, .jpeg, .svg, gif or .bmp file', 'error');
            return;
        }
        if (fileType === 0 || fileType === 1) {
            this.uploading = true;
            this.filesApiService.UploadMedia(formData).subscribe(response => {
                this.encryptThenSend(response, fileType, conversationID, aesKey, file);
            }, () => {
                Swal.fire('Error', 'Upload failed', 'error');
                this.finishUpload();
            });
        } else if (fileType === 3) {
            const audioSrc = URL.createObjectURL(file);
            const audioHTMLString = `<audio controls src="${ audioSrc }"></audio>`;
            Swal.fire({
                title: 'Are you sure to send this message?',
                html: audioHTMLString,
                type: 'question',
                showCancelButton: true
            }).then(result => {
                if (result.value) {
                    this.uploading = true;
                    this.filesApiService.UploadFile(formData, conversationID).subscribe(response => {
                        this.encryptThenSend(response, fileType, conversationID, aesKey, file);
                    }, () => {
                        Swal.fire('Error', 'Upload failed', 'error');
                        this.finishUpload();
                    });
                }
                URL.revokeObjectURL(audioSrc);
            });
        } else {
            this.uploading = true;
            this.filesApiService.UploadFile(formData, conversationID).subscribe(response => {
                    this.encryptThenSend(response, fileType, conversationID, aesKey, file);
            }, () => {
                Swal.fire('Error', 'Upload failed', 'error');
                this.finishUpload();
            });
        }
    }

    private encryptThenSend(response: number | UploadFile, fileType: number, conversationID: number, aesKey: string, file: File): void {
        if (Number(response)) {
            this.progress = <number>response;
        } else if (response != null) {
            if ((<UploadFile>response).code === 0) {
                let encedMessages;
                switch (fileType) {
                    case 0:
                        loadImage(
                            file,
                            function (img, data) {
                                let orientation = 0;
                                if (data.exif) {
                                    orientation = data.exif.get('Orientation');
                                }
                                encedMessages = AES.encrypt(`[img]${(<UploadFile>response).fileKey}-${img.height}-${
                                    img.width}-${orientation}`, aesKey).toString();
                                this.sendMessage(encedMessages, conversationID);
                            }.bind(this),
                            {meta: true}
                        );
                        break;
                    case 1:
                        encedMessages = AES.encrypt(`[video]${(<UploadFile>response).fileKey}`, aesKey).toString();
                        this.sendMessage(encedMessages, conversationID);
                        break;
                    case 2:
                        encedMessages = AES.encrypt(this.formatFileMessage(<UploadFile>response), aesKey).toString();
                        this.sendMessage(encedMessages, conversationID);
                        break;
                    case 3:
                        encedMessages = AES.encrypt(`[audio]${(<UploadFile>response).fileKey}`, aesKey).toString();
                        this.sendMessage(encedMessages, conversationID);
                        break;
                    default:
                        break;
                }
            }
        }
    }

    private sendMessage(message: string, conversationID: number): void {
        this.conversationApiService.SendMessage(conversationID, message, [])
            .subscribe(() => {
                this.finishUpload();
                this.scrollBottom(true);
            }, () => {
                const unsentMessages = new Map(JSON.parse(localStorage.getItem('unsentMessages')));
                if (unsentMessages.get(conversationID) && (<Array<string>>unsentMessages.get(conversationID)).length > 0) {
                    const tempArray = <Array<string>>unsentMessages.get(conversationID);
                    tempArray.push(message);
                    unsentMessages.set(conversationID, tempArray);
                } else {
                    unsentMessages.set(conversationID, [message]);
                }
                localStorage.setItem('unsentMessages', JSON.stringify(Array.from(unsentMessages)));
                this.finishUpload();
            });
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
        this.uploading = false;
        this.progress = 0;
    }

    public scrollBottom(smooth: boolean): void {
        if (!this.talkingDestroyed) {
            const h = document.documentElement.scrollHeight || document.body.scrollHeight;
            if (document.querySelector('.message-list').scrollHeight < window.innerHeight - 50) {
                window.scroll(0, 0);
            } else if (smooth) {
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
            this.uploading = true;
            const uploadButton = document.querySelector('#upload');
            uploadButton.textContent = 'Uploading';
            this.filesApiService.UploadIcon(formData).subscribe(response => {
                if (Number(response)) {
                    this.progress = <number>response;
                } else if (response != null && (<UploadFile>response).code === 0) {
                    this.progress = 0;
                    user.headImgFileKey = (<UploadFile>response).fileKey;
                    user.avatarURL = (<UploadFile>response).downloadPath;
                    this.uploading = false;
                    uploadButton.textContent = 'Upload new avatar';
                }
            });
        } else {
            Swal.fire('Try again', 'Only support .png, .jpg, .jpeg or .bmp file', 'error');
        }
    }

    private validImageType(file: File, avatar: boolean): boolean {
        const validAvatarTypes = ['png', 'jpg', 'bmp', 'jpeg'];
        const validChatTypes = ['png', 'jpg', 'bmp', 'jpeg', 'gif', 'svg'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
        if (avatar) {
            return validAvatarTypes.includes(fileExtension);
        } else {
            return validChatTypes.includes(fileExtension);
        }
    }

    public getFileKey(message: string): number {
        if (message === null || message.length < 5) {
            return -1;
        }
        if (message.startsWith('[img]')) {
            return Number(message.substring(5, message.indexOf('-')));
        } else if (message.startsWith('[file]')) {
            return Number(message.substring(6, message.indexOf('-')));
        } else if (message.startsWith('[video]') || message.startsWith('[audio]')) {
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

    public getAudio(target: HTMLElement, message: string): void {
        const filekey = this.getFileKey(message);
        if (filekey !== -1 && !isNaN(filekey) && filekey !== 0) {
            this.filesApiService.GetFileURL(filekey).subscribe(response => {
                if (response.code === 0) {
                    target.style.display = 'none';
                    const audioElement = document.createElement('audio');
                    audioElement.style.maxWidth = '100%';
                    audioElement.src = response.downloadPath;
                    audioElement.controls = true;
                    target.parentElement.appendChild(audioElement);
                    audioElement.play();
                }
            });
        }
    }

    private formatFileMessage(response: UploadFile): string {
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
