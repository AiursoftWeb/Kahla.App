import { Injectable } from '@angular/core';
import { EventType } from '../Models/EventType';
import { AiurEvent } from '../Models/AiurEvent';
import Swal from 'sweetalert2';
import { NewMessageEvent } from '../Models/NewMessageEvent';
import { Conversation } from '../Models/Conversation';
import { Message } from '../Models/Message';
import { ConversationApiService } from './ConversationApiService';
import { map } from 'rxjs/operators';
import { UploadService } from './UploadService';
import { KahlaUser } from '../Models/KahlaUser';
import { AES, enc } from 'crypto-js';
import { CacheService } from './CacheService';
import * as he from 'he';
import Autolinker from 'autolinker';
import { Values } from '../values';

@Injectable({
    providedIn: 'root'
})

export class MessageService {
    public conversation: Conversation;
    public localMessages: Message[];
    public messageAmount = 15;
    public noMoreMessages = true;
    public loadingMore = false;
    public belowWindowPercent = 0;
    public newMessages = false;
    private oldOffsetHeight: number;
    public maxImageWidth = 0;
    public electron = false;
    public me: KahlaUser;

    constructor(
        private conversationApiService: ConversationApiService,
        private uploadService: UploadService,
        private cacheService: CacheService
    ) {
        if (navigator.userAgent.toLowerCase().includes('electron')) {
            this.electron = true;
        }
    }

    public OnMessage(data: MessageEvent) {
        const ev = JSON.parse(data.data) as AiurEvent;
        switch (ev.type) {
            case EventType.NewMessage:
                const evt = ev as NewMessageEvent;
                if (this.conversation && this.conversation.id === evt.conversationId) {
                    this.getMessages(true, this.conversation.id);
                    this.messageAmount++;
                    if (!document.hasFocus()) {
                        this.showNotification(evt);
                    }
                } else {
                    this.cacheService.autoUpdateConversation();
                    this.showNotification(evt);
                }
                break;
            case EventType.NewFriendRequest:
                Swal.fire('Friend request', 'You have got a new friend request!', 'info');
                this.cacheService.autoUpdateRequests();
                break;
            case EventType.WereDeletedEvent:
                Swal.fire('Were deleted', 'You were deleted by one of your friends from his friend list.', 'info');
                this.cacheService.autoUpdateConversation();
                break;
            case EventType.FriendAcceptedEvent:
                Swal.fire('Friend request', 'Your friend request was accepted!', 'success');
                this.cacheService.autoUpdateConversation();
                break;
        }
    }

    public getMessages(getDown: boolean, id: number): void {
        this.conversationApiService.GetMessage(id, this.messageAmount)
            .pipe(
                map(t => t.items)
            )
            .subscribe(messages => {
                if (!this.conversation) {
                    return;
                }
                messages.forEach(t => {
                    try {
                        t.content = AES.decrypt(t.content, this.conversation.aesKey).toString(enc.Utf8);
                    } catch (error) {
                        t.content = '';
                    }
                    if (t.content.startsWith('[video]') || t.content.startsWith('[img]')) {
                        const filekey = this.uploadService.getFileKey(t.content);
                        if (filekey === -1 || isNaN(filekey)) {
                            t.content = '';
                        } else if (t.content.startsWith('[img]')) {
                            let imageWidth = Number(t.content.split('-')[2]), imageHeight = Number(t.content.split('-')[1]);
                            if (t.content.substring(5).split('-')[3] === '6' || t.content.substring(5).split('-')[3] === '8' ||
                                t.content.substring(5).split('-')[3] === '5' || t.content.substring(5).split('-')[3] === '7') {
                                [imageWidth, imageHeight] = [imageHeight, imageWidth];
                            }
                            const ratio = imageHeight / imageWidth * 100;
                            if (this.maxImageWidth < imageWidth) {
                                imageWidth = this.maxImageWidth;
                                imageHeight = Math.floor(this.maxImageWidth * ratio / 100);
                            }
                            const displayWidth = imageWidth;
                            if (t.content.substring(5).split('-')[3] === '6' || t.content.substring(5).split('-')[3] === '8' ||
                                t.content.substring(5).split('-')[3] === '5' || t.content.substring(5).split('-')[3] === '7') {
                                [imageWidth, imageHeight] = [imageHeight, imageWidth];
                            }
                            t.content = '[img]' + Values.fileAddress + t.content.substring(5).split('-')[0] + '?w=' + imageWidth +
                                '&h=' + imageHeight + '-' + displayWidth + '-' + ratio + '-' +
                                this.getOrientationClassName(t.content.substring(5).split('-')[3]);
                        }
                    } else if (!t.content.startsWith('[file]')) {
                        t.content = he.encode(t.content);
                        t.content = Autolinker.link(t.content, { stripPrefix: false});
                    }
                });
                if (messages.length < 15) {
                    this.noMoreMessages = true;
                } else {
                    this.noMoreMessages = false;
                }
                if (typeof this.localMessages !== 'undefined' && this.localMessages !== null &&
                    this.localMessages.length > 0 && messages.length > 0) {
                    if (!getDown && messages[0].id === this.localMessages[0].id) {
                        this.noMoreMessages = true;
                    }
                    if (this.me && messages[messages.length - 1].senderId !== this.me.id && messages[messages.length - 1].id !==
                        this.localMessages[this.localMessages.length - 1].id && this.belowWindowPercent > 0) {
                        this.newMessages = true;
                    } else {
                        this.newMessages = false;
                    }
                }
                this.localMessages = messages;
                if (getDown && this.belowWindowPercent <= 0.2) {
                    setTimeout(() => {
                        this.uploadService.scrollBottom(true);
                    }, 0);
                } else if (!getDown) {
                    this.loadingMore = false;
                    setTimeout(() => {
                        window.scroll(0, document.documentElement.offsetHeight - this.oldOffsetHeight);
                    }, 0);
                }
            });
    }

    public updateBelowWindowPercent(): void {
        this.belowWindowPercent = (document.documentElement.offsetHeight - document.documentElement.scrollTop
            - window.innerHeight) / window.innerHeight;
    }

    public loadMore(): void {
        if (!this.noMoreMessages) {
            this.loadingMore = true;
            this.oldOffsetHeight = document.documentElement.offsetHeight;
            this.messageAmount += 15;
            this.getMessages(false, this.conversation.id);
        }
    }

    public updateFriends(): void {
        this.cacheService.autoUpdateFriends();
        this.cacheService.autoUpdateRequests();
    }

    public updateMaxImageWidth(): void {
        this.maxImageWidth = Math.floor((window.innerWidth - 40) * 0.7 - 20 - 2);
    }

    public resetVariables(): void {
        this.conversation = null;
        this.localMessages = null;
        this.messageAmount = 15;
        this.noMoreMessages = true;
        this.loadingMore = false;
        this.belowWindowPercent = 0;
        this.newMessages = false;
        this.oldOffsetHeight = 0;
        this.maxImageWidth = 0;
    }

    private getOrientationClassName(exifValue: string): string {
        switch (exifValue) {
            case '0':
            case '1':
                return '';
            case '2':
                return 'flip';
            case '3':
                return 'bottom_right';
            case '4':
                return 'flip_bottom_right';
            case '5':
                return 'flip_right_top';
            case '6':
                return 'right_top';
            case '7':
                return 'flip_left_bottom';
            case '8':
                return 'left_bottom';
            default:
                return '';
        }
    }

    private showNotification(event: NewMessageEvent): void {
        if (!event.muted && event.sender.id !== this.me.id && this.electron) {
            event.content = AES.decrypt(event.content, event.aesKey).toString(enc.Utf8);
            event.content = this.cacheService.modifyMessage(event.content);
            const notify = new Notification(event.sender.nickName, {
                body: event.content,
                icon: Values.fileAddress + event.sender.headImgFileKey
            });
            notify.onclick = function(clickEvent) {
                clickEvent.preventDefault();
                window.focus();
            };
        }
    }
}
