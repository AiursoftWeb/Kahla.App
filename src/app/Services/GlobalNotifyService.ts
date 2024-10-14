import { Injectable } from '@angular/core';
import { EventService } from './EventService';
import { AiurEvent } from '../Models/Events/AiurEvent';
import { EventType } from '../Models/Events/EventType';
import Swal from 'sweetalert2';
import { SomeoneLeftEvent } from '../Models/Events/SomeoneLeftEvent';
import { CacheService } from './CacheService';
import { Router } from '@angular/router';
import { NewMessageEvent } from '../Models/Events/NewMessageEvent';
import { MessageService } from './MessageService';
import { HomeService } from './HomeService';

@Injectable({providedIn: 'root'})
export class GlobalNotifyService {

    constructor(private eventService: EventService,
                private cacheService: CacheService,
                private messageService: MessageService,
                private homeService: HomeService,
                private router: Router) {
    }

    private OnMessage(ev: AiurEvent) {
        const fireAlert = !localStorage.getItem('deviceID');
        switch (ev.type) {
            case EventType.NewMessage: {
                const evt = ev as NewMessageEvent;
                const conversationCacheIndex = this.cacheService.cachedData.conversations
                    .findIndex(x => x.id === evt.message.conversationId);
                if (conversationCacheIndex !== -1) {
                    const conversationCache = this.cacheService.cachedData.conversations[conversationCacheIndex];
                    const latestMsg = Object.assign({}, evt.message);
                    conversationCache.latestMessage = latestMsg;
                    if (this.messageService.conversation?.id !== evt.message.conversationId || !document.hasFocus()) {
                        conversationCache.unReadAmount++;
                        if (evt.mentioned) {
                            conversationCache.someoneAtMe = true;
                        }
                    } else {
                        conversationCache.unReadAmount = 0; // clear red dot when something went wrong
                    }
                    // move the new conversation to the top
                    this.cacheService.cachedData.conversations.splice(conversationCacheIndex, 1);
                    this.cacheService.cachedData.conversations.splice(0, 0, conversationCache);
                    this.cacheService.saveCache();
                    this.cacheService.updateTotalUnread();
                } else {
                    if (this.homeService.wideScreenEnabled || this.router.isActive('home', false)) {
                        setTimeout(() => this.cacheService.updateConversation(), 1000);
                    }
                }
                if (this.messageService.conversation?.id !== evt.message.conversationId) {
                    this.showNotification(evt);
                }
                break;
            }
            case EventType.SomeoneLeftEvent: {
                const evt = ev as SomeoneLeftEvent;
                if (evt.leftUser.id === this.cacheService.cachedData.me.id) {
                    Swal.fire('Oops, you have been kicked.',
                        `You have been kicked by the owner of group ${this.cacheService.cachedData.conversations
                            .find(x => x.id === evt.conversationId).name}.`,
                        'warning');
                    this.cacheService.updateConversation();
                }
                break;
            }
            case EventType.DissolveEvent: {
                this.cacheService.updateConversation();
                break;
            }
            case EventType.GroupJoinedEvent: {
                this.cacheService.updateConversation();
                break;
            }
            default:
                break;
        }
    }

    public init() {
        this.eventService.onMessage.subscribe(t => this.OnMessage(t));
    }

    private showNotification(event: NewMessageEvent): void {
        console.log(event);
        // if (!event.muted &&
        //     event.message.sender.id !== this.cacheService.cachedData.me.id &&
        //     this._electronService.isElectronApp &&
        //     localStorage.getItem('setting-electronNotify') !== 'false') {
        //     event.message.content = AES.decrypt(event.message.content, event.aesKey).toString(enc.Utf8);
        //     event.message.content = this.cacheService.modifyMessage(event.message.content);
        //     const notify = new Notification(event.message.sender.nickName, {
        //         body: event.message.content,
        //         icon: this.probeService.encodeProbeFileUrl(event.message.sender.iconFilePath)
        //     });
        //     notify.onclick = function (clickEvent) {
        //         clickEvent.preventDefault();
        //         window.focus();
        //     };
        // }
        // TODO: electron
    }
}
