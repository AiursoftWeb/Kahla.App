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
import { Notify } from './Notify';
import { CacheService } from './CacheService';
import * as he from 'he';
import * as Autolinker from 'autolinker';
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

    public me: KahlaUser;
    public eventType: EventType;

    constructor(
        private conversationApiService: ConversationApiService,
        private uploadService: UploadService,
        private notify: Notify,
        private cacheService: CacheService
    ) {}

    public OnMessage(data: MessageEvent) {
        const ev = JSON.parse(data.data) as AiurEvent;
        switch (ev.type) {
            case EventType.NewMessage:
                const evt = ev as NewMessageEvent;
                if (this.conversation && this.conversation.id === evt.conversationId) {
                    this.getMessages(true, this.conversation.id);
                    this.messageAmount++;
                    if (!document.hasFocus() && !evt.muted) {
                        this.notify.ShowNewMessage(evt, this.me.id);
                    }
                } else {
                    this.cacheService.autoUpdateConversation();
                    if (!evt.muted) {
                        this.notify.ShowNewMessage(evt, this.me.id);
                    }
                }
                break;
            case EventType.NewFriendRequest:
                Swal('Friend request', 'You have got a new friend request!', 'info');
                this.cacheService.autoUpdateRequests();
                break;
            case EventType.WereDeletedEvent:
                Swal('Were deleted', 'You were deleted by one of your friends from his friend list.', 'info');
                this.cacheService.autoUpdateConversation();
                break;
            case EventType.FriendAcceptedEvent:
                Swal('Friend request', 'Your friend request was accepted!', 'success');
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
                            let imageWidth = 0, imageHeight = 0;
                            if (this.maxImageWidth > Number(t.content.split('-')[2])) {
                                imageWidth = Number(t.content.split('-')[2]);
                                imageHeight = Number(t.content.split('-')[1]);
                            } else {
                                imageWidth = this.maxImageWidth;
                                imageHeight = Math.floor(this.maxImageWidth *
                                    Number(t.content.split('-')[1]) / Number(t.content.split('-')[2]));
                            }
                            t.content = '[img]' + Values.fileAddress + t.content.substring(5).split('-')[0] + '?w=' + imageWidth +
                                '&h=' + imageHeight + '-' + imageWidth + '-' + imageHeight / imageWidth * 100;
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
}
