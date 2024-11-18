import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConversationApiService } from '../Services/Api/ConversationApiService';
import { Message } from '../Models/Message';
import { UploadService } from '../Services/UploadService';
import { MessageService } from '../Services/MessageService';
import { KahlaUser } from '../Models/KahlaUser';
import { HeaderComponent } from './header.component';
import { CacheService } from '../Services/CacheService';
import { Conversation } from '../Models/Conversation';
import { FileType } from '../Models/FileType';
import { ProbeService } from '../Services/ProbeService';
import { uuid4 } from '../Utils/Uuid';
import EmojiButton from '@joeattardi/emoji-button';
import { ThemeService } from '../Services/ThemeService';
import { MessageFileRef } from '../Models/MessageFileRef';
import { MessageContent } from '../Models/Messages/MessageContent';
import { MessageSegmentFile } from '../Models/Messages/MessageSegments';

@Component({
    templateUrl: '../Views/talking.html',
    styleUrls: [
        '../Styles/talking.scss',
        '../Styles/button.scss',
        '../Styles/reddot.scss',
        '../Styles/menu.scss',
        '../Styles/badge.scss',
    ],
})
export class TalkingComponent implements OnInit, OnDestroy {
    public content = '';
    public showPanel = false;
    private windowInnerHeight = 0;
    private formerWindowInnerHeight = 0;
    private keyBoardHeight = 0;
    private conversationID = 0;
    public autoSaveInterval;
    public recording = false;
    private mediaRecorder;
    private forceStopTimeout;
    private oldContent: string;
    private chatInputHeight: number;
    private picker: EmojiButton;
    public showUserList = false;
    public lastAutoLoadMoreTimestamp = 0;
    public matchedUsers: KahlaUser[] = [];
    public loadingMore: boolean;

    @ViewChild('imageInput') public imageInput;
    @ViewChild('videoInput') public videoInput;
    @ViewChild('fileInput') public fileInput;
    @ViewChild('header', { static: true }) public header: HeaderComponent;

    constructor(
        private router: Router,
        public uploadService: UploadService,
        public messageService: MessageService,
        public cacheService: CacheService,
        public probeService: ProbeService
    ) {}

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
        if (
            window.scrollY <= 0 &&
            document.documentElement.scrollHeight > document.documentElement.clientHeight + 100 &&
            this.messageService.conversation &&
            !this.messageService.messageLoading &&
            !this.messageService.noMoreMessages
        ) {
            const now = Date.now();
            const interval =
                this.messageService.showMessagesCount < this.messageService.localMessages.length
                    ? 10
                    : 2000;
            if (this.lastAutoLoadMoreTimestamp + interval < now) {
                this.loadMore();
                this.lastAutoLoadMoreTimestamp = now;
            } else {
                setTimeout(
                    () => this.onScroll(),
                    this.lastAutoLoadMoreTimestamp + interval + 10 - now
                );
            }
        }
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

    public updateConversation(conversation: Conversation): void {
        this.messageService.conversation = conversation;
        this.header.title = conversation.displayName;
        this.header.button = true;
        if (conversation.anotherUserId) {
            this.header.buttonIcon = 'user';
            this.header.buttonLink = `/user/${conversation.anotherUserId}`;
        } else {
            this.header.buttonIcon = `users`;
            this.header.buttonLink = `/group/${conversation.id}`;
        }
    }

    public complete(nickname: string): void {
        const input = document.getElementById('chatInput') as HTMLTextAreaElement;
        const typingWords = this.content.slice(0, input.selectionStart).split(/\s|\n/);
        const typingWord = typingWords[typingWords.length - 1];
        const before = this.content.slice(
            0,
            input.selectionStart - typingWord.length + typingWord.indexOf('@')
        );
        this.content = `${before}@${nickname.replace(
            / /g,
            ''
        )} ${this.content.slice(input.selectionStart)}`;
        this.showUserList = false;
        const pointerPos = before.length + nickname.replace(/ /g, '').length + 2;
        setTimeout(() => {
            input.setSelectionRange(pointerPos, pointerPos);
            input.focus();
        }, 0);
    }

    public ngOnDestroy(): void {
        this.destroyCurrent();
    }

    public destroyCurrent() {
        this.messageService.talkingDestroyed = true;
        this.content = null;
        this.showPanel = null;
        this.messageService.resetVariables();
        this.conversationID = null;
        clearInterval(this.autoSaveInterval);
        this.autoSaveInterval = null;
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
        if (this.messageService.showMessagesCount < this.messageService.localMessages.length) {
            this.messageService.showMessagesCount += 15;
        } else if (!this.messageService.noMoreMessages) {
            this.loadingMore = false;
            this.messageService.showMessagesCount = this.messageService.localMessages.length;
        } else {
            return;
        }
        setTimeout(() => {
            window.scroll(0, document.documentElement.scrollHeight - oldScrollHeight);
        }, 0);
    }

    temp_demo_msg: Message[] = [];

    public takeMessages(): Message[] {
        // return this.messageService.localMessages.slice(
        //     Math.max(
        //         this.messageService.rawMessages.length - this.messageService.showMessagesCount,
        //         0
        //     )
        // );
        if (!this.cacheService?.cachedData?.me) return [];
        if (this.temp_demo_msg.length === 0) {
            this.temp_demo_msg = [
                {
                    id: uuid4(),
                    content: JSON.stringify({
                        segments: [
                            {
                                type: 'text',
                                content:
                                    'A text message. \nAutolinker test: https://google.com \nA loooooooong text the quick brown fox jumps over the lazy dog. \n There are a lot of space between                                here.\nLoren ipsum dolor sit amet, consectetur adipiscing elit. Loren ipsum dolor sit amet, consectetur adipiscing elit. Loren ipsum dolor sit amet, consectetur adipiscing elit. Loren ipsum dolor sit amet, consectetur adipiscing elit. Loren ipsum dolor sit amet, consectetur adipiscing elit. Loren ipsum dolor sit amet, consectetur adipiscing elit. Loren ipsum dolor sit amet, consectetur adipiscing elit. Loren ipsum dolor sit amet, consectetur adipiscing elit. Loren ipsum dolor sit amet, consectetur adipiscing elit. Loren ipsum dolor sit amet, consectetur adipiscing elit. Loren ipsum dolor sit amet, consectetur adipiscing elit. ',
                                ats: [],
                            },
                        ],
                        v: 1,
                    } satisfies MessageContent),
                    senderId: uuid4(),
                    sender: this.cacheService.cachedData.me,
                    local: true,
                    sendTimeDate: new Date(),
                } as Message,
                {
                    id: uuid4(),
                    content: JSON.stringify({
                        segments: [
                            {
                                type: 'text',
                                content: 'A image message with a text',
                                ats: [],
                            },
                            {
                                type: 'image',
                                url: 'aaa',
                                width: 3840,
                                height: 2160,
                            },
                        ],
                        v: 1,
                    } satisfies MessageContent),
                    senderId: this.cacheService.cachedData.me.id,
                    sender: this.cacheService.cachedData.me,
                    local: true,
                    sendTimeDate: new Date(),
                } as Message,
                {
                    id: uuid4(),
                    content: JSON.stringify({
                        segments: [
                            {
                                type: 'text',
                                content: 'A file message with a text',
                                ats: [],
                            },
                            {
                                type: 'file',
                                size: 123456789,
                                fileName: 'test.txt',
                                url: 'aaa',
                            } satisfies MessageSegmentFile,
                        ],
                        v: 1,
                    } satisfies MessageContent),
                    senderId: this.cacheService.cachedData.me.id,
                    sender: this.cacheService.cachedData.me,
                    local: true,
                    sendTimeDate: new Date(),
                } as Message,
            ];
        }
        return this.temp_demo_msg;
    }

    public send({ content }: { content: MessageContent }) {
        this.temp_demo_msg.push({
            id: uuid4(),
            content: JSON.stringify(content),
            senderId: this.cacheService.cachedData.me.id,
            sender: this.cacheService.cachedData.me,
            local: true,
            sendTimeDate: new Date(),
        } as Message);
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
