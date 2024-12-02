﻿import {
    afterRenderEffect,
    Component,
    effect,
    HostListener,
    input,
    resource,
    signal,
} from '@angular/core';
import { MessageService } from '../Services/MessageService';
import { CacheService } from '../Services/CacheService';
import { uuid4 } from '../Utils/Uuid';
import { MessageContent } from '../Models/Messages/MessageContent';
import { ParsedMessage } from '../Models/Messages/ParsedMessage';
import { lastValueFrom } from 'rxjs';
import { MessagesApiService } from '../Services/Api/MessagesApiService';
import { scrollBottom } from '../Utils/Scrolling';
import { ThreadsApiService } from '../Services/Api/ThreadsApiService';
import { KahlaMessagesRepo } from '@aiursoft/kahla-sdk.js';
import { ThreadInfoCacheDictionary } from '../Caching/ThreadInfoCacheDictionary';
import { showCommonErrorDialog } from '../Utils/CommonErrorDialog';

@Component({
    templateUrl: '../Views/talking.html',
    styleUrls: ['../Styles/talking.scss'],
    standalone: false,
})
export class TalkingComponent {
    public repo?: KahlaMessagesRepo;
    public parsedMessages = signal<ParsedMessage[]>([]);
    public showPanel = signal(false);
    public hasNewMessages = signal(false);

    // route input
    public id = input.required<number>();

    public threadInfo = resource({
        request: () => this.id(),
        loader: ({ request }) => {
            try {
                return this.threadInfoCacheDictionary.get(request);
            } catch (err) {
                showCommonErrorDialog(err);
            }
        },
    });

    constructor(
        public messageService: MessageService,
        public cacheService: CacheService,
        messageApiService: MessagesApiService,
        public threadApiService: ThreadsApiService,
        public threadInfoCacheDictionary: ThreadInfoCacheDictionary
    ) {
        effect(async cleanup => {
            if (!this.id()) return;
            this.parsedMessages.set([]);
            // Obtain the websocket connection token
            try {
                const resp = await lastValueFrom(messageApiService.InitThreadWebsocket(this.id()));
                this.repo = new KahlaMessagesRepo(resp.webSocketEndpoint, true);
                const sub = this.repo.messages.messages.onChange.subscribe(event => {
                    const newItem = ParsedMessage.fromCommit(event.newNode.value);
                    switch (event.type) {
                        case 'addFirst':
                            this.parsedMessages.set([newItem, ...this.parsedMessages()]);
                            break;
                        case 'addLast':
                            this.parsedMessages.set([...this.parsedMessages(), newItem]);
                            break;
                        case 'addBefore':
                            {
                                const lastIndex = this.parsedMessages().findLastIndex(
                                    t => t.id === event.refNode!.value.id
                                );
                                if (lastIndex !== -1) {
                                    this.parsedMessages.set([
                                        ...this.parsedMessages().slice(0, lastIndex),
                                        newItem,
                                        ...this.parsedMessages().slice(lastIndex),
                                    ]);
                                }
                            }
                            break;
                    }
                });
                this.repo.connect();
                cleanup(() => {
                    sub.unsubscribe();
                    this.repo.disconnect();
                });
            } catch (err) {
                showCommonErrorDialog(err);
            }
        });

        afterRenderEffect(() => {
            this.parsedMessages();
            if (!scrollBottom(true, 500)) {
                // User ignored new messages
                this.hasNewMessages.set(true);
            }
        });
    }

    @HostListener('window:scroll', [])
    onScroll() {
        const belowWindowPercent =
            (document.documentElement.scrollHeight -
                window.scrollY -
                document.documentElement.clientHeight) /
            document.documentElement.clientHeight;
        if (belowWindowPercent <= 0) {
            this.hasNewMessages.set(false);
        }
    }

    public async loadMore() {
        const oldScrollHeight = document.documentElement.scrollHeight;
        setTimeout(() => {
            window.scroll(0, document.documentElement.scrollHeight - oldScrollHeight);
        }, 0);
    }

    public send({ content }: { content: MessageContent }) {
        this.repo.send({
            content: JSON.stringify(content),
            senderId: this.cacheService.mine().me.id ?? uuid4(),
            preview: this.messageService.buildPreview(content),
        });
    }
}
