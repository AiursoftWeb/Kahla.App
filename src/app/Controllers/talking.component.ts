import {
    afterRenderEffect,
    Component,
    effect,
    HostListener,
    OnDestroy,
    OnInit,
    resource,
    signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../Services/MessageService';
import { CacheService } from '../Services/CacheService';
import { uuid4 } from '../Utils/Uuid';
import { MessageFileRef } from '../Models/MessageFileRef';
import { MessageContent } from '../Models/Messages/MessageContent';
import { ParsedMessage } from '../Models/Messages/ParsedMessage';
import { AVCArrayStorage, AVCRepository, AVCWebsocketRemote } from 'aiur-version-control';
import { MessageCommit } from '../Models/Messages/MessageCommit';
import { lastValueFrom, map } from 'rxjs';
import { MessagesApiService } from '../Services/Api/MessagesApiService';
import { scrollBottom } from '../Utils/Scrolling';
import { ThreadsApiService } from '../Services/Api/ThreadsApiService';

@Component({
    templateUrl: '../Views/talking.html',
    styleUrls: ['../Styles/talking.scss'],
    standalone: false,
})
export class TalkingComponent implements OnInit, OnDestroy {
    private windowInnerHeight = 0;
    private formerWindowInnerHeight = 0;
    private keyBoardHeight = 0;
    private conversationID = 0;
    private chatInputHeight: number;
    public lastAutoLoadMoreTimestamp = 0;

    public repo?: AVCRepository<MessageCommit>;
    public remote?: AVCWebsocketRemote<MessageCommit>;
    public parsedMessages = signal<ParsedMessage[]>([]);
    public showPanel = signal(false);
    public threadId = signal(0);

    public threadInfo = resource({
        request: () => this.threadId(),
        loader: async ({ request }) => {
            if (request)
                return (await lastValueFrom(this.threadApiService.DetailsJoined(request))).thread;
        },
    });

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        public messageService: MessageService,
        public cacheService: CacheService,
        private messageApiService: MessagesApiService,
        public threadApiService: ThreadsApiService
    ) {
        this.route.params.pipe(map(t => Number(t.id))).subscribe(async id => {
            this.threadId.set(id);
        });

        effect(async cleanup => {
            if (!this.threadId()) return;
            this.parsedMessages.set([]);
            this.repo = new AVCRepository(new AVCArrayStorage());
            // Obtain the websocket connection token
            const resp = await lastValueFrom(
                messageApiService.InitThreadWebsocket(this.threadId())
            );
            this.remote = new AVCWebsocketRemote<MessageCommit>(resp.webSocketEndpoint);
            this.remote.attach(this.repo, true, true);
            const sub = this.repo.commitsStorage.onAdded.subscribe(event => {
                const newMessages = [...this.parsedMessages()];
                newMessages.splice(
                    event.afterIdx + 1,
                    0,
                    ...event.newEntries.map(t => ParsedMessage.fromCommit(t))
                );
                this.parsedMessages.set(newMessages);
            });
            cleanup(() => {
                sub.unsubscribe();
                this.remote.detach();
            });
        });

        afterRenderEffect(() => {
            this.parsedMessages();
            scrollBottom(true, 500);
        });
    }

    @HostListener('window:resize', [])
    onResize() {
        if (window.innerHeight < this.windowInnerHeight) {
            this.keyBoardHeight = this.windowInnerHeight - window.innerHeight;
            window.scroll(0, window.scrollY + this.keyBoardHeight);
        } else if (
            window.innerHeight - this.formerWindowInnerHeight > 100 &&
            this.messageService.belowWindowPercent > 0.2
        ) {
            window.scroll(0, window.scrollY - this.keyBoardHeight);
        } else if (window.innerHeight - this.formerWindowInnerHeight > 100) {
            window.scroll(0, window.scrollY);
        }
        this.formerWindowInnerHeight = window.innerHeight;
    }

    @HostListener('window:scroll', [])
    onScroll() {
        this.messageService.updateBelowWindowPercent();
        if (this.messageService.belowWindowPercent <= 0) {
            this.messageService.newMessages = false;
        }
        // if (
        //     window.scrollY <= 0 &&
        //     document.documentElement.scrollHeight > document.documentElement.clientHeight + 100 &&
        //     this.messageService.conversation &&
        //     !this.messageService.messageLoading
        // ) {
        //     const now = Date.now();
        //     const interval =
        //         this.messageService.showMessagesCount < this.messageService.localMessages.length
        //             ? 10
        //             : 2000;
        //     if (this.lastAutoLoadMoreTimestamp + interval < now) {
        //         this.loadMore();
        //         this.lastAutoLoadMoreTimestamp = now;
        //     } else {
        //         setTimeout(
        //             () => this.onScroll(),
        //             this.lastAutoLoadMoreTimestamp + interval + 10 - now
        //         );
        //     }
        // }
    }

    public ngOnInit(): void {
        // this.route.params.subscribe(async params => {
        //     if (!this.messageService.talkingDestroyed) {
        //         this.destroyCurrent();
        //     }
        //     this.messageService.talkingDestroyed = false;
        //     this.conversationID = Number(params.id);
        //     if (this.cacheService.cachedData.conversationDetail[this.conversationID]) {
        //         this.updateConversation(
        //             this.cacheService.cachedData.conversationDetail[this.conversationID]
        //         );
        //         this.messageService.initMessage(this.conversationID);
        //     } else {
        //         const listItem = this.cacheService.cachedData.conversations.find(
        //             t => t.id === this.conversationID
        //         );
        //         if (listItem) {
        //             this.header.title = listItem.name;
        //         } else {
        //             this.header.title = 'Loading...';
        //         }
        //     }
        //     this.content = localStorage.getItem('draft' + this.conversationID);
        //     this.autoSaveInterval = setInterval(() => {
        //         if (this.content !== null) {
        //             localStorage.setItem('draft' + this.conversationID, this.content);
        //         }
        //     }, 1000);
        //     this.updateInputHeight();
        //     if (!isMobileDevice()) {
        //         inputElement.focus();
        //     }
        //     const conversation = (
        //         await this.conversationApiService
        //             .ConversationDetail(this.conversationID)
        //             .toPromise()
        //     ).value;
        //     if (this.conversationID !== conversation.id || this.messageService.talkingDestroyed) {
        //         return;
        //     }
        //     this.updateConversation(conversation);
        //     if (!this.cacheService.cachedData.conversationDetail[this.conversationID]) {
        //         this.messageService.initMessage(this.conversationID);
        //     }
        //     this.cacheService.cachedData.conversationDetail[this.conversationID] = conversation;
        //     this.cacheService.saveCache();
        // });
        // this.windowInnerHeight = window.innerHeight;
    }

    public ngOnDestroy(): void {
        this.destroyCurrent();
    }

    public destroyCurrent() {
        this.messageService.talkingDestroyed = true;
        this.showPanel = null;
        this.messageService.resetVariables();
        this.conversationID = null;
    }

    public shareToOther(fileRef: MessageFileRef): void {
        this.messageService.shareRef = fileRef;
        this.router.navigate(
            [
                'share-target',
                {
                    srcConversation: this.conversationID,
                },
            ],
            { skipLocationChange: true }
        );
    }

    public getAtListMaxHeight(): number {
        return window.innerHeight - this.chatInputHeight - 106;
    }

    public async loadMore() {
        const oldScrollHeight = document.documentElement.scrollHeight;
        setTimeout(() => {
            window.scroll(0, document.documentElement.scrollHeight - oldScrollHeight);
        }, 0);
    }

    public send({ content }: { content: MessageContent }) {
        // this.temp_demo_msg.push(
        //     new ParsedMessage(uuid4(), content, this.cacheService.cachedData.me.id, new Date())
        // );
        this.repo.commit({
            content: JSON.stringify(content),
            senderId: this.cacheService.cachedData.me.id ?? uuid4(),
        });
    }

    // @HostListener('window:focus')
    // public onFocus() {
    //     const conversationCache = this.cacheService.cachedData.conversations.find(
    //         t => t.id === this.conversationID
    //     );
    //     if (conversationCache) {
    //         conversationCache.messageContext.unReadAmount = 0;
    //         this.cacheService.updateTotalUnread();
    //     }
    // }
}
