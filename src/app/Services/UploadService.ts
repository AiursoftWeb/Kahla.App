import { Injectable } from '@angular/core';
import { FilesApiService } from './Api/FilesApiService';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { UploadFile } from '../Models/Probe/UploadFile';
import { KahlaUser } from '../Models/KahlaUser';
import { ConversationApiService } from './Api/ConversationApiService';
import * as loadImage from 'blueimp-load-image';
import { GroupConversation } from '../Models/GroupConversation';
import { FileType } from '../Models/FileType';
import { ProbeService } from './ProbeService';
import { uuid4 } from '../Helpers/Uuid';
import { MessageFileRef } from '../Models/MessageFileRef';
import { AiurValue } from '../Models/AiurValue';
import { Message } from '../Models/Message';

@Injectable({
    providedIn: 'root',
})
export class UploadService {
    constructor(
        private filesApiService: FilesApiService,
        private conversationApiService: ConversationApiService,
        private probeService: ProbeService
    ) {}

    public upload(
        file: File,
        conversationID: number,
        fileType: FileType
    ): Promise<AiurValue<Message>> {
        if (!this.validateFileSize(file)) {
            Swal.fire(
                'Error',
                'File size should larger than or equal to one bit and less then or equal to 2047MB.',
                'error'
            );
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        if (fileType === FileType.Image && !this.validImageType(file, false)) {
            Swal.fire(
                'Try again',
                'Only support .png, .jpg, .jpeg, .svg, gif or .bmp file',
                'error'
            );
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
                showCancelButton: true,
            }).then(result => {
                if (result.value) {
                    this.filesApiService
                        .InitFileAccess(conversationID, true)
                        .subscribe(response => {
                            if (response.code === 0) {
                                this.filesApiService
                                    .UploadFile(formData, response.uploadAddress)
                                    .subscribe(
                                        res => {
                                            this.buildFileRef(res, fileType, file)?.then(t => {
                                                this.encryptThenSend(t, conversationID);
                                            });
                                        },
                                        () => {
                                            Swal.close();
                                            Swal.fire('Error', 'Upload failed', 'error');
                                        }
                                    );
                            }
                        });
                }
                URL.revokeObjectURL(audioSrc);
            });
        } else {
            const alert = this.fireUploadingAlert(
                `Uploading your ${fileType === FileType.Image ? 'image' : fileType === FileType.Video ? 'video' : 'file'}...`
            );
            return new Promise<AiurValue<Message>>((resolve, reject) => {
                this.filesApiService.InitFileAccess(conversationID, true).subscribe(response => {
                    if (response.code === 0) {
                        const mission = this.filesApiService
                            .UploadFile(formData, response.uploadAddress)
                            .subscribe(
                                res => {
                                    if (Number(res)) {
                                        this.updateAlertProgress(Number(res));
                                    } else if (res) {
                                        Swal.close();
                                        this.buildFileRef(res, fileType, file)?.then(t => {
                                            this.encryptThenSend(t, conversationID).then(t_ => {
                                                resolve(t_);
                                            });
                                        });
                                    }
                                },
                                () => {
                                    Swal.close();
                                    Swal.fire('Error', 'Upload failed', 'error');
                                    reject();
                                }
                            );
                        alert.then(result => {
                            if (result.dismiss) {
                                mission.unsubscribe();
                                reject();
                            }
                        });
                    } else {
                        reject();
                    }
                });
            });
        }
    }

    private fireUploadingAlert(title: string): Promise<SweetAlertResult> {
        const result = Swal.fire({
            title: title,
            html: '<div id="progressText">0%</div><progress id="uploadProgress" max="100"></progress>',
            showCancelButton: true,
            showConfirmButton: false,
            allowOutsideClick: false,
        });
        Swal.showLoading();
        Swal.enableButtons();
        return result;
    }

    private updateAlertProgress(progress: number): void {
        (<HTMLProgressElement>Swal.getHtmlContainer().querySelector('#uploadProgress')).value =
            progress;
        (<HTMLDivElement>Swal.getHtmlContainer().querySelector('#progressText')).innerText =
            `${progress}%`;
    }

    public encryptThenSend(
        fileRef: MessageFileRef,
        conversationID: number
    ): Promise<AiurValue<Message>> {
        if (!fileRef) {
            return null;
        }
        switch (fileRef.fileType) {
            case FileType.Image:
                return this.sendMessage(
                    `[img]${fileRef.filePath}|${fileRef.imgWidth}|${fileRef.imgHeight}`,
                    conversationID
                );
            case FileType.Video:
                return this.sendMessage(`[video]${fileRef.filePath}`, conversationID);
            case FileType.File:
                return this.sendMessage(
                    `[file]${fileRef.filePath}|${fileRef.fileName}|${fileRef.fileSize}`,
                    conversationID
                );
            case FileType.Audio:
                return this.sendMessage(`[audio]${fileRef.filePath}`, conversationID);
            default:
                return null;
        }
    }

    private sendMessage(message: string, conversationID: number): Promise<AiurValue<Message>> {
        return new Promise((resolve, reject) => {
            this.conversationApiService.SendMessage(conversationID, message, uuid4(), []).subscribe(
                t => {
                    resolve(t);
                },
                () => {
                    Swal.fire('Send Failed.', 'Please check your network connection.', 'error');
                    reject();
                }
            );
        });
    }

    private validateFileSize(file: File): boolean {
        if (file === null || file === undefined) {
            return false;
        }
        return file.size >= 0.125 && file.size <= 2146435072;
    }

    public uploadAvatar(user: KahlaUser, file: File): void {
        if (this.validImageType(file, true)) {
            const formData = new FormData();
            formData.append('image', file);
            const alert = this.fireUploadingAlert('Uploading your avatar...');

            this.filesApiService.InitIconUpload().subscribe(response => {
                if (response.code === 0) {
                    const mission = this.filesApiService
                        .UploadFile(formData, response.value)
                        .subscribe(res => {
                            if (Number(res)) {
                                this.updateAlertProgress(Number(res));
                            } else if (res != null && (<UploadFile>res).code === 0) {
                                Swal.close();
                                user.iconFilePath = (<UploadFile>res).filePath;
                                user.avatarURL = this.probeService.encodeProbeFileUrl(
                                    user.iconFilePath
                                );
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
                    const mission = this.filesApiService
                        .UploadFile(formData, response.value)
                        .subscribe(res => {
                            if (Number(res)) {
                                this.updateAlertProgress(Number(res));
                            } else if (res != null && (<UploadFile>res).code === 0) {
                                Swal.close();
                                group.groupImagePath = (<UploadFile>res).filePath;
                                group.avatarURL = this.probeService.encodeProbeFileUrl(
                                    group.groupImagePath
                                );
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

    public buildFileRef(
        response: number | UploadFile,
        fileType: FileType,
        file: File
    ): Promise<MessageFileRef> {
        if (!response || Number(response) || (<UploadFile>response).code !== 0) {
            return null;
        }
        return new Promise<MessageFileRef>(resolve => {
            const fileRef = new MessageFileRef();
            fileRef.filePath = (<UploadFile>response).filePath;
            fileRef.fileType = fileType;
            fileRef.fileSize = this.probeService.getFileSizeText((<UploadFile>response).fileSize);
            fileRef.fileName = file.name;
            if (fileType === FileType.Image) {
                loadImage(
                    file,
                    (img, data) => {
                        let orientation = 0,
                            width = img.width,
                            height = img.height;
                        if (data.exif) {
                            orientation = data.exif.get('Orientation');
                            if (orientation >= 5 && orientation <= 8) {
                                [width, height] = [height, width];
                            }
                        }
                        fileRef.imgWidth = width;
                        fileRef.imgHeight = height;
                        resolve(fileRef);
                    },
                    { meta: true }
                );
            } else {
                resolve(fileRef);
            }
        });
    }

    public getFileDescriptionFromType(fileType: FileType): string {
        switch (fileType) {
            case FileType.Image:
                return 'Image';
            case FileType.Video:
                return 'Video';
            case FileType.File:
                return 'File';
            case FileType.Audio:
                return 'Audio';
        }
        return '';
    }
}
