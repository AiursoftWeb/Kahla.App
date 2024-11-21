import { Injectable } from '@angular/core';
import { EventType } from '../Models/Events/EventType';
import { AiurEvent } from '../Models/Events/AiurEvent';
import { CacheService } from './CacheService';
import { Router } from '@angular/router';
import { SomeoneLeftEvent } from '../Models/Events/SomeoneLeftEvent';
import { MessageFileRef } from '../Models/MessageFileRef';
import { MyContactsRepository } from '../Repositories/MyContactsRepository';

@Injectable({
    providedIn: 'root',
})
export class MessageService {
    public belowWindowPercent = 0;
    public newMessages = false;
    public videoHeight = 0;
    public messageLoading = false;
    public shareRef: MessageFileRef;
    public talkingDestroyed = false;
    public showMessagesCount = 15;

    constructor(
        private myContactsRepository: MyContactsRepository,
        private cacheService: CacheService,
        private router: Router
    ) {}

    public async OnMessage(ev: AiurEvent) {
        switch (ev.type) {
            case EventType.NewMessage: {
                break;
            }
            case EventType.NewMemberEvent: {
                // const evt = ev as NewMemberEvent;
                // if (this.conversation.id === evt.conversationId) {
                //     this.conversationApiService
                //         .ConversationDetail(evt.conversationId)
                //         .subscribe(updated => {
                //             this.conversation = updated.value;
                //         });
                //     SwalToast.fire({
                //         title: `${evt.newMember.nickName} joined the group.`,
                //         icon: 'info',
                //         position: 'bottom',
                //     });
                // }
                break;
            }
            case EventType.SomeoneLeftEvent: {
                const evt = ev as SomeoneLeftEvent;
                break;
            }
            case EventType.DissolveEvent: {
                break;
            }
        }
    }

    public reconnectPull() {
        this.cacheService.updateConversation();
        this.myContactsRepository.updateAll();
    }

    public updateBelowWindowPercent(): void {
        this.belowWindowPercent =
            (document.documentElement.scrollHeight -
                window.scrollY -
                document.documentElement.clientHeight) /
            document.documentElement.clientHeight;
    }

    public resetVariables(): void {
        this.belowWindowPercent = 0;
    }

    public upperFloorImageSize(width: number) {
        return Math.pow(2, Math.ceil(Math.log2(width)));
    }
}
