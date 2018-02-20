import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { AiurValue } from '../Models/AiurValue';
import { AiurCollection } from '../Models/AiurCollection';
import { KahlaUser } from '../Models/KahlaUser';
import { Request } from '../Models/Request';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import { AiurProtocal } from '../Models/AiurProtocal';
import { Message } from '../Models/Message';
import { URLSearchParams } from '@angular/http';
import { ParamService } from './ParamService';
import { InitPusherViewModel } from '../Models/ApiModels/InitPusherViewModel';
import { ContactInfo } from '../Models/ContactInfo';
import { Conversation } from '../Models/Conversation';
import { Jsonp } from '@angular/http';
import { Values } from '../values';
import { NewMessageEvent } from '../Models/NewMessageEvent';

@Injectable()
export class Notify {
    public Show(title: string, content: string, icon: string): void {
        if ('Notification' in window) {
            Notification.requestPermission((result) => {
                if (result === 'granted') {
                    if ('serviceWorker' in navigator) {
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
                    }
                }
            });
        }
    }

    public ShowNewMessage(evt: NewMessageEvent, myId: string): void {
        if (evt.sender.id !== myId) {
            this.Show(evt.sender.nickName, evt.content, evt.sender.headImgUrl);
        }
    }

    public ShowFriendRequest(): void {

    }
}
