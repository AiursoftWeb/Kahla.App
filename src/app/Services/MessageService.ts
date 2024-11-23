import { Injectable } from '@angular/core';
import { EventType } from '../Models/Events/EventType';
import { AiurEvent } from '../Models/Events/AiurEvent';
import { CacheService } from './CacheService';
import { MyContactsRepository } from '../Repositories/MyContactsRepository';
import { MessageContent } from '../Models/Messages/MessageContent';
import { truncateUTF8Bytes } from '../Utils/StringUtils';

@Injectable({
    providedIn: 'root',
})
export class MessageService {
    public belowWindowPercent = 0;

    constructor(
        private myContactsRepository: MyContactsRepository,
        private cacheService: CacheService,
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

    public buildPreview(content: MessageContent) {
        const previewCandidates = content.segments.map(t => {
            switch(t.type) {
                case 'text':
                    return t.content;
                default:
                    return `[${t.type}]`;
            }
        }).join(' ');


        return truncateUTF8Bytes(previewCandidates, 47, true);
    }
}
