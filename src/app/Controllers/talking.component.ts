import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConversationApiService } from '../Services/Api/ConversationApiService';
import { Message } from '../Models/Message';
import Swal from 'sweetalert2';
import { UploadService } from '../Services/UploadService';
import { MessageService } from '../Services/MessageService';
import { KahlaUser } from '../Models/KahlaUser';
import { HeaderComponent } from './header.component';
import { GroupsResult } from '../Models/GroupsResults';
import { FriendshipService } from '../Services/FriendshipService';
import { CacheService } from '../Services/CacheService';
import { Conversation } from '../Models/Conversation';
import { FileType } from '../Models/FileType';
import { ProbeService } from '../Services/ProbeService';
import { uuid4 } from '../Utils/Uuid';
import * as EmojiButton from '@joeattardi/emoji-button';
import { ThemeService } from '../Services/ThemeService';
import { MessageFileRef } from '../Models/MessageFileRef';
import { checkEmoji } from '../Utils/StringUtils';
import { isMobileDevice } from '../Utils/EnvironmentUtils';
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
        private route: ActivatedRoute,
        private router: Router,
        private conversationApiService: ConversationApiService,
        public uploadService: UploadService,
        public messageService: MessageService,
        public cacheService: CacheService,
        private friendshipService: FriendshipService,
        private themeService: ThemeService,
        public probeService: ProbeService
    ) {}

    @HostListener('window:resize', [])
    onResize() {
        this.messageService.updateMaxImageWidth();
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

    @HostListener('keydown', ['$event'])
    onKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter' && !this.showUserList) {
            e.preventDefault();
            if (
                (e.altKey || e.ctrlKey || e.shiftKey) ===
                this.cacheService.cachedData.options.enableEnterToSendMessage
            ) {
                this.insertToSelection('\n');
                this.oldContent = ''; // prevent send message on keyup
            } else {
                this.oldContent = this.content;
            }
        }
    }

    @HostListener('keyup', ['$event'])
    onKeyup(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (this.showUserList) {
                // accept default suggestion
                this.complete(this.matchedUsers[0].nickName);
            } else if (this.oldContent === this.content) {
                this.send();
                this.showUserList = false;
            }
        } else if (this.content && e.key !== 'Backspace') {
            this.showUserList = false;
            const input = document.getElementById('chatInput') as HTMLTextAreaElement;
            const typingWords = this.content.slice(0, input.selectionStart).split(/\s|\n/);
            const typingWord = typingWords[typingWords.length - 1];
            if (typingWord.charAt(0) === '@') {
                const searchName = typingWord.slice(1).toLowerCase();
                const searchResults = this.messageService.searchUser(searchName, false);
                if (searchResults.length > 0) {
                    this.matchedUsers = searchResults;
                    this.showUserList = true;
                }
            }
        } else {
            this.showUserList = false;
        }
    }

    public ngOnInit(): void {
        // const inputElement = document.querySelector('#chatInput') as HTMLElement;
        // inputElement.addEventListener('input', () => {
        //     inputElement.style.height = 'auto';
        //     inputElement.style.height = inputElement.scrollHeight + 'px';
        //     this.chatInputHeight = inputElement.scrollHeight;
        //     if (document.querySelector('#scrollDown')) {
        //         (document.querySelector('#scrollDown') as HTMLElement).style.bottom =
        //             inputElement.scrollHeight + 46 + 'px';
        //     }
        // });
        // this.route.params.subscribe(async params => {
        //     if (!this.messageService.talkingDestroyed) {
        //         this.destroyCurrent();
        //     }
        //     this.messageService.talkingDestroyed = false;
        //     this.messageService.updateMaxImageWidth();
        //     this.conversationID = Number(params.id);
        //     const unread = params.unread && params.unread <= 50 ? Number(params.unread) : 0;
        //     const load = unread < 15 ? 15 : unread;
        //     if (this.cacheService.cachedData.conversationDetail[this.conversationID]) {
        //         this.updateConversation(
        //             this.cacheService.cachedData.conversationDetail[this.conversationID]
        //         );
        //         this.messageService.initMessage(this.conversationID);
        //         this.messageService.getMessages(unread, this.conversationID, null, load);
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
        //         this.messageService.getMessages(unread, this.conversationID, null, load);
        //     }
        //     this.cacheService.cachedData.conversationDetail[this.conversationID] = conversation;
        //     this.cacheService.saveCache();
        // });
        // this.windowInnerHeight = window.innerHeight;
    }

    private updateInputHeight(): void {
        const inputElement = document.querySelector('#chatInput') as HTMLElement;
        setTimeout(() => {
            inputElement.style.height = inputElement.scrollHeight + 'px';
            this.chatInputHeight = inputElement.scrollHeight;
        }, 0);
    }

    public updateConversation(conversation: Conversation): void {
        this.messageService.conversation = conversation;
        this.messageService.groupConversation = conversation.discriminator === 'GroupConversation';
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

    public trackByMessages(_index: number, message: Message): string {
        return message.id;
    }

    public send(): void {
        if (this.content.trim().length === 0) {
            return;
        }
        const tempMessage: Message = {
            id: uuid4(),
            content: this.content,
            senderId: this.cacheService.cachedData.me.id,
            sender: this.cacheService.cachedData.me,
            local: true,
            sendTime: new Date().toISOString(),
        } as Message;
        if (this.messageService.localMessages.length > 0) {
            const prevMsg =
                this.messageService.localMessages[this.messageService.localMessages.length - 1];
            tempMessage.groupWithPrevious =
                prevMsg.senderId === this.cacheService.cachedData.me.id &&
                new Date().getTime() - prevMsg.timeStamp <= 3600000;
        }
        this.messageService.localMessages.push(tempMessage);
        setTimeout(() => {
            this.messageService.scrollBottom(true);
        }, 0);
        this.conversationApiService
            .SendMessage(
                this.messageService.conversation.id,
                this.content,
                tempMessage.id,
                this.messageService.getAtIDs(this.content).slice(1)
            )
            .subscribe({
                error: e => {
                    if (e.status === 0 || e.status === 503) {
                        const unsentMessages = new Map(
                            JSON.parse(localStorage.getItem('unsentMessages'))
                        );
                        const tempArray = unsentMessages.get(this.conversationID) as Message[];
                        if (tempArray && tempArray.length > 0) {
                            tempArray.push(tempMessage);
                            unsentMessages.set(this.conversationID, tempArray);
                        } else {
                            unsentMessages.set(this.conversationID, [tempMessage]);
                        }
                        localStorage.setItem(
                            'unsentMessages',
                            JSON.stringify(Array.from(unsentMessages))
                        );
                        this.messageService.localMessages.splice(
                            this.messageService.localMessages.indexOf(tempMessage),
                            1
                        );
                        this.messageService.showFailedMessages();
                        this.messageService.reorderLocalMessages();
                        this.messageService.scrollBottom(false);
                    }
                },
                next: p => {
                    const index = this.messageService.localMessages.indexOf(tempMessage);
                    if (index !== -1) {
                        this.messageService.localMessages.splice(index, 1);
                        this.messageService.insertMessage(p.value);
                    }
                },
            });
        this.content = '';
        const inputElement = document.querySelector('#chatInput') as HTMLTextAreaElement;
        inputElement.focus();
        inputElement.style.height = 34 + 'px';
    }

    public resend(message: Message): void {
        const messageIDArry = this.messageService.getAtIDs(message.content);
        this.conversationApiService
            .SendMessage(
                this.messageService.conversation.id,
                message.content,
                message.id,
                messageIDArry.slice(1)
            )
            .subscribe(result => {
                if (result.code === 0) {
                    this.delete(message);
                }
            });
    }

    public delete(message: Message): void {
        this.messageService.localMessages.splice(
            this.messageService.localMessages.indexOf(message),
            1
        );
        const unsentMessages = new Map(JSON.parse(localStorage.getItem('unsentMessages')));
        const tempArray = unsentMessages.get(this.conversationID) as Message[];
        const index = tempArray.findIndex(t => t.id === message.id);
        tempArray.splice(index, 1);
        unsentMessages.set(this.conversationID, tempArray);
        localStorage.setItem('unsentMessages', JSON.stringify(Array.from(unsentMessages)));
    }

    public startInput(): void {
        if (this.showPanel) {
            this.showPanel = false;
            document.querySelector('.message-list').classList.remove('active-list');
            if (this.messageService.belowWindowPercent > 0) {
                window.scroll(0, window.scrollY - 105);
            }
        }
    }

    public togglePanel(): void {
        this.showPanel = !this.showPanel;
        if (this.showPanel) {
            window.scroll(0, window.scrollY + 105);
        } else {
            if (this.messageService.belowWindowPercent <= 0.2) {
                this.messageService.scrollBottom(false);
            } else {
                window.scroll(0, window.scrollY - 105);
            }
        }
    }

    public uploadInput(fileType: FileType): void {
        this.showPanel = false;
        document.querySelector('.message-list').classList.remove('active-list');
        let files;
        if (this.fileInput.nativeElement.files.length > 0) {
            files = this.fileInput.nativeElement.files[0];
        }
        if (this.videoInput.nativeElement.files.length > 0) {
            files = this.videoInput.nativeElement.files[0];
        }
        if (this.imageInput.nativeElement.files.length > 0) {
            files = this.imageInput.nativeElement.files[0];
        }
        if (files) {
            if (fileType !== FileType.File) {
                files = this.probeService.renameFile(
                    files,
                    fileType === FileType.Image ? 'img_' : 'video_'
                );
            }
            this.uploadService
                .upload(files, this.messageService.conversation.id, fileType)
                ?.then(t => {
                    this.messageService.insertMessage(t.value);
                    setTimeout(() => this.messageService.scrollBottom(true), 0);
                });
        }
    }

    public paste(event: ClipboardEvent): void {
        const items = event.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                this.preventDefault(event);
                const originalFile = items[i].getAsFile();
                const blob = this.probeService.renameFile(originalFile, 'clipboardImg_');
                if (blob != null) {
                    const urlString = URL.createObjectURL(blob);
                    Swal.fire({
                        title: 'Are you sure to post this image?',
                        imageUrl: urlString,
                        showCancelButton: true,
                    }).then(send => {
                        if (send.value) {
                            this.uploadService
                                .upload(blob, this.messageService.conversation.id, FileType.Image)
                                ?.then(t => {
                                    this.messageService.insertMessage(t.value);
                                    setTimeout(() => this.messageService.scrollBottom(true), 0);
                                });
                        }
                        URL.revokeObjectURL(urlString);
                    });
                }
            }
        }
    }

    public drop(event: DragEvent): void {
        this.preventDefault(event);
        const fileList: File[] = [];
        if (event.dataTransfer.items != null) {
            const items = event.dataTransfer.items;
            for (let i = 0; i < items.length; i++) {
                fileList.push(items[i].getAsFile());
            }
        } else {
            const files = event.dataTransfer.files;
            for (let i = 0; i < files.length; i++) {
                fileList.push(files[i]);
            }
        }
        fileList.forEach(async t => {
            let fileType = FileType.File;
            if (
                this.uploadService.validImageType(t, false) &&
                (
                    await Swal.fire({
                        title: `Send "${t.name}" as`,
                        confirmButtonText: 'Image',
                        cancelButtonText: 'File',
                        icon: 'question',
                        showCancelButton: true,
                    })
                ).value
            ) {
                fileType = FileType.Image;
            }
            if (
                this.uploadService.validVideoType(t) &&
                (
                    await Swal.fire({
                        title: `Send "${t.name}" as`,
                        confirmButtonText: 'Video',
                        cancelButtonText: 'File',
                        icon: 'question',
                        showCancelButton: true,
                    })
                ).value
            ) {
                fileType = FileType.Video;
            }

            this.uploadService
                .upload(t, this.messageService.conversation.id, fileType)
                ?.then(msg => {
                    this.messageService.insertMessage(msg.value);
                    setTimeout(() => this.messageService.scrollBottom(true), 0);
                });
        });
        this.removeDragData(event);
    }

    public preventDefault(event: DragEvent | ClipboardEvent): void {
        event.preventDefault();
        event.stopPropagation();
    }

    private removeDragData(event: DragEvent): void {
        if (event.dataTransfer.items) {
            event.dataTransfer.items.clear();
        } else {
            event.dataTransfer.clearData();
        }
    }

    public record(): void {
        if (this.recording) {
            this.mediaRecorder.stop();
        } else {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(
                stream => {
                    this.recording = true;
                    this.mediaRecorder = new MediaRecorder(stream);
                    this.mediaRecorder.start();
                    const audioChunks = [];
                    this.mediaRecorder.addEventListener('dataavailable', event => {
                        audioChunks.push(event.data);
                    });
                    this.mediaRecorder.addEventListener('stop', () => {
                        this.recording = false;
                        const audioBlob = new File(
                            audioChunks,
                            `voiceMsg_${new Date().getTime()}.opus`
                        );
                        this.uploadService
                            .upload(audioBlob, this.conversationID, FileType.Audio)
                            .then(() => this.messageService.scrollBottom(true));
                        clearTimeout(this.forceStopTimeout);
                        stream.getTracks().forEach(track => track.stop());
                    });
                    this.forceStopTimeout = setTimeout(
                        () => {
                            this.mediaRecorder.stop();
                        },
                        1000 * 60 * 5
                    );
                },
                () => {
                    return;
                }
            );
        }
    }

    public emoji(): void {
        const chatBox = document.querySelector('.chat-box') as HTMLElement;
        if (!this.picker) {
            this.picker = new EmojiButton({
                position: 'top-start',
                zIndex: 20,
                theme: this.themeService.IsDarkTheme() ? 'dark' : 'light',
                autoFocusSearch: false,
                showSearch: false,
            });
            this.picker.on('emoji', emoji => {
                this.insertToSelection(emoji);
            });
        }
        this.picker.togglePicker(chatBox);
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

    public hideUserList(): void {
        this.showUserList = false;
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

    public insertToSelection(content: string) {
        const input = document.getElementById('chatInput') as HTMLTextAreaElement;
        this.content = this.content
            ? `${this.content.slice(
                  0,
                  input.selectionStart
              )}${content}${this.content.slice(input.selectionStart)}`
            : content;
        this.updateInputHeight();
    }

    public async loadMore() {
        const oldScrollHeight = document.documentElement.scrollHeight;
        if (this.messageService.showMessagesCount < this.messageService.localMessages.length) {
            this.messageService.showMessagesCount += 15;
        } else if (!this.messageService.noMoreMessages) {
            this.loadingMore = true;
            await this.messageService.getMessages(
                -1,
                this.messageService.conversation.id,
                this.messageService.localMessages[0].id,
                15
            );
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
