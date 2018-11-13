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
import * as Autolinker from 'autolinker';
import { KahlaUser } from '../Models/KahlaUser';
import { Values } from '../values';
import { AES, enc } from 'crypto-js';
import { Notify } from './Notify';
import { CacheService } from './CacheService';

@Injectable({
    providedIn: 'root'
})

export class MessageService {
    public static conversation: Conversation;
    public localMessages: Message[];
    public messageAmount = 15;
    private colors = ['aqua', 'aquamarine', 'bisque', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chocolate',
        'coral', 'cornflowerblue', 'darkcyan', 'darkgoldenrod'];
    public userNameColors = new Map();
    public noMoreMessages = true;
    public loadingMore = false;
    public belowWindowPercent = 0;
    public newMessages = false;
    private oldOffsetHeight: number;

    public me: KahlaUser;
    public eventType: EventType;

    constructor(
        private conversationApiService: ConversationApiService,
        private uploadService: UploadService,
        private notify: Notify,
        private cacheService: CacheService
    ) {}

    public getConversation(): Conversation {
        return MessageService.conversation;
    }

    public OnMessage(data: MessageEvent) {
        const ev = JSON.parse(data.data) as AiurEvent;
        switch (ev.type) {
            case EventType.NewMessage:
                const evt = ev as NewMessageEvent;
                if (MessageService.conversation && MessageService.conversation.id === evt.conversationId) {
                    this.getMessages(true, MessageService.conversation.id);
                    this.messageAmount++;
                    if (!document.hasFocus()) {
                        this.notify.ShowNewMessage(evt, this.me.id);
                    }
                } else {
                    this.cacheService.autoUpdateConversation(null);
                    this.notify.ShowNewMessage(evt, this.me.id);
                }
                break;
            case EventType.NewFriendRequest:
                Swal('Friend request', 'You have got a new friend request!', 'info');
                this.cacheService.autoUpdateRequests();
                break;
            case EventType.WereDeletedEvent:
                Swal('Were deleted', 'You were deleted by one of your friends from his friend list.', 'info');
                this.cacheService.autoUpdateConversation(null);
                break;
            case EventType.FriendAcceptedEvent:
                Swal('Friend request', 'Your friend request was accepted!', 'success');
                this.cacheService.autoUpdateConversation(null);
                break;
        }
    }

    public getMessages(getDown: boolean, id: number): void {
        this.conversationApiService.GetMessage(id, this.messageAmount)
            .pipe(
                map(t => t.items)
            )
            .subscribe(messages => {
                messages.forEach(t => {
                    t.content = AES.decrypt(t.content, MessageService.conversation.aesKey).toString(enc.Utf8);
                    if (t.content.startsWith('[video]') || t.content.startsWith('[img]')) {
                        const filekey = this.uploadService.getFileKey(t.content);
                        if (filekey !== -1 && !isNaN(filekey) && filekey !== 0) {
                            if (t.content.startsWith('[video]')) {
                                t.content = '[video]' + Values.ossDownloadPath + filekey;
                            } else {
                                t.content = '[img]' + Values.ossDownloadPath + filekey;
                            }
                        } else {
                            t.content = '';
                        }
                    } else if (!t.content.startsWith('[img]')) {
                        // replace URLs to links
                        t.content = Autolinker.link(t.content, { stripPrefix: false});
                    }
                    if (MessageService.conversation.discriminator === 'GroupConversation' && this.me && t.senderId !== this.me.id &&
                        !this.userNameColors.has(t.senderId)) {
                        this.userNameColors.set(t.senderId, this.colors[Math.floor(Math.random() * this.colors.length)]);
                    }
                    t.sender.avatarURL = Values.fileAddress + t.sender.headImgFileKey;
                });
                if (messages.length < 15) {
                    this.noMoreMessages = true;
                } else {
                    this.noMoreMessages = false;
                }
                if (typeof this.localMessages !== 'undefined' && this.localMessages.length > 0 && messages.length > 0) {
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

    public loadMore(): void {
        if (!this.noMoreMessages) {
            this.loadingMore = true;
            this.oldOffsetHeight = document.documentElement.offsetHeight;
            this.messageAmount += 15;
            this.getMessages(false, MessageService.conversation.id);
        }
    }

    public updateFriends(callback: () => void): void {
        this.cacheService.autoUpdateConversation(callback);
        this.cacheService.autoUpdateRequests();
    }
}
