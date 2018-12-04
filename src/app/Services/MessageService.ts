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
import { AES, enc } from 'crypto-js';
import { Notify } from './Notify';
import { CacheService } from './CacheService';
import * as he from 'he';

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
                    this.getMessages(true, this.conversation.id, false);
                    this.messageAmount++;
                    if (!document.hasFocus() && !evt.muted) {
                        this.notify.ShowNewMessage(evt, this.me.id);
                    }
                } else {
                    this.cacheService.autoUpdateConversation(null);
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
                this.cacheService.autoUpdateConversation(null);
                break;
            case EventType.FriendAcceptedEvent:
                Swal('Friend request', 'Your friend request was accepted!', 'success');
                this.cacheService.autoUpdateConversation(null);
                break;
        }
    }

    public getMessages(getDown: boolean, id: number, init: boolean): void {
        this.conversationApiService.GetMessage(id, this.messageAmount)
            .pipe(
                map(t => t.items)
            )
            .subscribe(messages => {
                if (!this.conversation) {
                    return;
                }
                messages.forEach(t => {
                    t.content = AES.decrypt(t.content, this.conversation.aesKey).toString(enc.Utf8);
                    if (t.content.startsWith('[video]') || t.content.startsWith('[img]')) {
                        const filekey = this.uploadService.getFileKey(t.content);
                        if (filekey === -1 || isNaN(filekey)) {
                            t.content = '';
                        }
                    } else if (!t.content.startsWith('[file]')) {
                        t.content = he.encode(t.content);
                        // replace URLs to links
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
                    }, 1000);
                } else if (!getDown && !init) {
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
            this.getMessages(false, this.conversation.id, false);
        }
    }

    public updateFriends(callback: () => void): void {
        this.cacheService.autoUpdateFriends(callback);
        this.cacheService.autoUpdateRequests();
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
    }
}
