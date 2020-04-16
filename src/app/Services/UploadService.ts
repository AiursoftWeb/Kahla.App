import { Injectable } from '@angular/core';
import { AES } from 'crypto-js';
import { FilesApiService } from './FilesApiService';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { UploadFile } from '../Models/Probe/UploadFile';
import { KahlaUser } from '../Models/KahlaUser';
import { ConversationApiService } from './ConversationApiService';
import * as loadImage from 'blueimp-load-image';
import { GroupConversation } from '../Models/GroupConversation';
import { FileType } from '../Models/FileType';
import { ProbeService } from './ProbeService';
import { uuid4 } from '../Helpers/Uuid';

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    public talkingDestroyed = false;

    constructor(
        private filesApiService: FilesApiService,
        private conversationApiService: ConversationApiService,
        private probeService: ProbeService,
    ) {}

    public upload(file: File, conversationID: number, aesKey: string, fileType: FileType): void {
        if (!this.validateFileSize(file)) {
            Swal.fire('Error', 'File size should larger than or equal to one bit and less then or equal to 2047MB.', 'error');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        if (fileType === FileType.Image && !this.validImageType(file, false)) {
            Swal.fire('Try again', 'Only support .png, .jpg, .jpeg, .svg, gif or .bmp file', 'error');
            return;
        }
        if (fileType === FileType.Video && !this.validVideoType(file)) {
            Swal.fire('Try again', 'Only support .mp4, .webm or .ogg file', 'error');
            return;
        }
        if (fileType === FileType.Audio) {
            const audioSrc = URL.createObjectURL(file);
            const audioHTMLString = `<audio controls src="${audioSrc}"></audio>`;
            Swal.fire({
                title: 'Are you sure to send this message?',
                html: audioHTMLString,
                icon: 'question',
                showCancelButton: true
            }).then(result => {
                if (result.value) {
                    this.filesApiService.InitFileUpload(conversationID).subscribe(response => {
                        if (response.code === 0) {
                            this.filesApiService.UploadFile(formData, response.value).subscribe(res => {
                                this.encryptThenSend(res, fileType, conversationID, aesKey, file);
                            }, () => {
                                Swal.close();
                                Swal.fire('Error', 'Upload failed', 'error');
                            });
                        }
                    });
                }
                URL.revokeObjectURL(audioSrc);
            });
        } else {
            const alert = this.fireUploadingAlert(`Uploading your ${fileType === FileType.Image ? 'image' : (fileType === FileType.Video ? 'video' : 'file')}...`);

            this.filesApiService.InitFileUpload(conversationID).subscribe(response => {
                if (response.code === 0) {
                    const mission = this.filesApiService.UploadFile(formData, response.value).subscribe(res => {
                        if (Number(res)) {
                            this.updateAlertProgress(Number(res));
                        } else if (res) {
                            Swal.close();
                            this.encryptThenSend(res, fileType, conversationID, aesKey, file);
                        }
                    }, () => {
                        Swal.close();
                        Swal.fire('Error', 'Upload failed', 'error');
                    });
                    alert.then(result => {
                        if (result.dismiss) {
                            mission.unsubscribe();
                        }
                    });
                }
            });
        }
    }

    private fireUploadingAlert(title: string): Promise<SweetAlertResult> {
        const result = Swal.fire({
            title: title,
            html: '<div id="progressText">0%</div><progress id="uploadProgress" max="100"></progress>',
            showCancelButton: true,
            showConfirmButton: false,
            allowOutsideClick: false
        });
        Swal.showLoading();
        Swal.enableButtons();
        return result;
    }

    private updateAlertProgress(progress: number): void {
        (<HTMLProgressElement>Swal.getContent().querySelector('#uploadProgress')).value = progress;
        (<HTMLDivElement>Swal.getContent().querySelector('#progressText')).innerText = `${progress}%`;
    }

    private encryptThenSend(response: number | UploadFile, fileType: FileType, conversationID: number, aesKey: string, file: File): void {
        if (response && !Number(response)) {
            if ((<UploadFile>response).code === 0) {
                switch (fileType) {
                    case FileType.Image:
                        loadImage(
                            file,
                            (img, data) => {
                                let orientation = 0, width = img.width, height = img.height;
                                if (data.exif) {
                                    orientation = data.exif.get('Orientation');
                                    if (orientation >= 5 && orientation <= 8) {
                                        [width, height] = [height, width];
                                    }
                                }
                                this.sendMessage(`[img]${(<UploadFile>response).filePath}|${width}|${
                                    height}|${orientation}`, conversationID, aesKey);
                            },
                            {meta: true}
                        );
                        break;
                    case FileType.Video:
                        this.sendMessage(`[video]${(<UploadFile>response).filePath}`, conversationID, aesKey);
                        break;
                    case FileType.File:
                        this.sendMessage(this.formatFileMessage(<UploadFile>response, file.name), conversationID, aesKey);
                        break;
                    case FileType.Audio:
                        this.sendMessage(`[audio]${(<UploadFile>response).filePath}`, conversationID, aesKey);
                        break;
                    default:
                        break;
                }
            }
        }
    }

    private sendMessage(message: string, conversationID: number, aesKey: string): void {
        this.conversationApiService.SendMessage(conversationID, AES.encrypt(message, aesKey).toString(), uuid4(), [])
            .subscribe(() => {
                this.scrollBottom(true);
            }, () => {
                Swal.fire('Send Failed.', 'Please check your network connection.', 'error');
            });
    }

    private validateFileSize(file: File): boolean {
        if (file === null || file === undefined) {
            return false;
        }
        return file.size >= 0.125 && file.size <= 2146435072;
    }

    public scrollBottom(smooth: boolean): void {
        if (!this.talkingDestroyed) {
            const h = document.documentElement.scrollHeight;
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
            const alert = this.fireUploadingAlert('Uploading your avatar...');

            this.filesApiService.InitIconUpload().subscribe(response => {
                if (response.code === 0) {
                    const mission = this.filesApiService.UploadFile(formData, response.value).subscribe(res => {
                        if (Number(res)) {
                            this.updateAlertProgress(Number(res));
                        } else if (res != null && (<UploadFile>res).code === 0) {
                            Swal.close();
                            user.iconFilePath = (<UploadFile>res).filePath;
                            user.avatarURL = this.probeService.encodeProbeFileUrl(user.iconFilePath);
                        }
                    });
                    alert.then(result => {
                        if (result.dismiss) {
                            mission.unsubscribe();
                        }
                    });
                }
            });
        } else {
            Swal.fire('Try again', 'Only support .png, .jpg, .jpeg or .bmp file', 'error');
        }
    }

    public uploadGroupAvater(group: GroupConversation, file: File): void {
        if (this.validImageType(file, true)) {
            const formData = new FormData();
            formData.append('image', file);
            const alert = this.fireUploadingAlert('Uploading group avatar...');

            this.filesApiService.InitIconUpload().subscribe(response => {
                if (response.code === 0) {
                    const mission = this.filesApiService.UploadFile(formData, response.value).subscribe(res => {
                        if (Number(res)) {
                            this.updateAlertProgress(Number(res));
                        } else if (res != null && (<UploadFile>res).code === 0) {
                            Swal.close();
                            group.groupImagePath = (<UploadFile>res).filePath;
                            group.avatarURL = this.probeService.encodeProbeFileUrl(group.groupImagePath);
                        }
                    });
                    alert.then(result => {
                        if (result.dismiss) {
                            mission.unsubscribe();
                        }
                    });
                }
            });

        } else {
            Swal.fire('Try again', 'Only support .png, .jpg, .jpeg or .bmp file', 'error');
        }
    }

    public validImageType(file: File, avatar: boolean): boolean {
        const validAvatarTypes = ['png', 'jpg', 'bmp', 'jpeg'];
        const validChatTypes = ['png', 'jpg', 'bmp', 'jpeg', 'gif', 'svg'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
        if (avatar) {
            return validAvatarTypes.includes(fileExtension);
        } else {
            return validChatTypes.includes(fileExtension);
        }
    }

    public validVideoType(file: File): boolean {
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats
        const validVideoType = ['webm', 'mp4', 'ogg'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
        return validVideoType.includes(fileExtension);
    }

    public getAudio(target: HTMLElement, message: string): void {
        target.style.display = 'none';
        const audioElement = document.createElement('audio');
        audioElement.style.maxWidth = '100%';
        audioElement.src = this.probeService.encodeProbeFileUrl(message.substring(7).split('|')[0]);
        audioElement.controls = true;
        target.parentElement.appendChild(audioElement);
        audioElement.play();
    }

    private formatFileMessage(response: UploadFile, fileName: string): string {
        return `[file]${response.filePath}|${fileName}|${this.probeService.getFileSizeText(response.fileSize)}`;
    }
}
