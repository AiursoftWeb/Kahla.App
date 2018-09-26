import { Injectable } from '@angular/core';
import { NewMessageEvent } from '../Models/NewMessageEvent';
import { environment } from '../../environments/environment';
import { AES, enc } from 'crypto-js';
import { ApiService } from '../Services/ApiService';

@Injectable()
export class Notify {
    constructor(
        private apiService: ApiService
    ) { }

    public Show(title: string, content: string, icon: string, openPath: string): void {
        if ('Notification' in window) {
            Notification.requestPermission((result) => {
                if (result === 'granted') {
                    if ('serviceWorker' in navigator && environment.production) {
                        console.warn('Sending notification using service worker...');
                        navigator.serviceWorker.ready.then(function (serviceWorkerRegistration) {
                            serviceWorkerRegistration.showNotification(title, {
                                body: content,
                                icon: icon,
                                tag: 'Kahla'
                            });
                        });
                    } else {
                        console.warn('Service workers aren\'t supported in this browser.');
                        const notify = new Notification(title, {
                            body: content,
                            icon: icon,
                        });
                        notify.onclick = function (event) {
                            event.preventDefault(); // prevent the browser from focusing the Notification's tab
                            location.href = openPath;
                            window.focus();
                        };
                    }
                }
            });
        }
    }

    public ShowNewMessage(evt: NewMessageEvent, myId: string): void {
        const openUrl = `/kahla/talking/${evt.conversationId}`;
        if (evt.sender.id !== myId) {
            evt.content = AES.decrypt(evt.content, evt.aesKey).toString(enc.Utf8);
            if (evt.content.startsWith('[img]')) {
                evt.content = 'Photo';
            }
            if (evt.content.startsWith('[file]')) {
                evt.content = 'File';
            }
            this.apiService.GetFile(evt.sender.headImgFileKey).subscribe(result => {
                this.Show(evt.sender.nickName, evt.content, result.file.internetPath, openUrl);
            });
        }
    }


    public ShowFriendRequest(): void {

    }
}
