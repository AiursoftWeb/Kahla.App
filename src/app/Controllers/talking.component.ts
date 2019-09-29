import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ConversationApiService } from '../Services/ConversationApiService';
import { Message } from '../Models/Message';
import { map, switchMap } from 'rxjs/operators';
import { AES } from 'crypto-js';
import Swal from 'sweetalert2';
import { Values } from '../values';
import { UploadService } from '../Services/UploadService';
import { MessageService } from '../Services/MessageService';
import * as he from 'he';
import Autolinker from 'autolinker';
import { TimerService } from '../Services/TimerService';
import { KahlaUser } from '../Models/KahlaUser';
import { ElectronService } from 'ngx-electron';
import { HeaderComponent } from './header.component';
import { GroupsResult } from '../Models/GroupsResults';
import { FriendshipService } from '../Services/FriendshipService';
import { CacheService } from '../Services/CacheService';
import { Conversation } from '../Models/Conversation';

declare var MediaRecorder: any;

@Component({
    templateUrl: '../Views/talking.html',
    styleUrls: ['../Styles/talking.scss',
        '../Styles/button.scss',
        '../Styles/reddot.scss',
        '../Styles/menu.scss',
        '../Styles/badge.scss']
})
export class TalkingComponent implements OnInit, OnDestroy {
    public content = '';
    public showPanel = false;
    public loadingImgURL = Values.loadingImgURL;
    private windowInnerHeight = 0;
    private formerWindowInnerHeight = 0;
    private keyBoardHeight = 0;
    public fileAddress = Values.fileAddress;
    private conversationID = 0;
    public autoSaveInterval;
    public recording = false;
    private mediaRecorder;
    private forceStopTimeout;
    private oldContent: string;
    private unread = 0;
    private load = 15;
    private chatInputHeight: number;
    public Math = Math;
    public Date = Date;
    public showUserList = false;
    public matchedUsers: Array<KahlaUser> = [];

    @ViewChild('imageInput', {static: false}) public imageInput;
    @ViewChild('videoInput', {static: false}) public videoInput;
    @ViewChild('fileInput', {static: false}) public fileInput;
    @ViewChild('header', {static: true}) public header: HeaderComponent;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private conversationApiService: ConversationApiService,
        public uploadService: UploadService,
        public messageService: MessageService,
        public cacheService: CacheService,
        public timerService: TimerService,
        private friendshipService: FriendshipService,
        public _electronService: ElectronService,
    ) {
    }

    @HostListener('window:resize', [])
    onResize() {
        this.messageService.updateMaxImageWidth();
        if (window.innerHeight < this.windowInnerHeight) {
            this.keyBoardHeight = this.windowInnerHeight - window.innerHeight;
            window.scroll(0, window.scrollY + this.keyBoardHeight);
        } else if (window.innerHeight - this.formerWindowInnerHeight > 100 && this.messageService.belowWindowPercent > 0.2) {
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
        if (window.scrollY <= 0 && document.documentElement.scrollHeight > document.documentElement.clientHeight + 100
            && this.messageService.conversation && !this.messageService.messageLoading && !this.messageService.noMoreMessages) {
            this.messageService.loadMore();
        }
    }

    @HostListener('keydown', ['$event'])
    onKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter' && !this.showUserList) {
            e.preventDefault();
            if (e.altKey || e.ctrlKey || e.shiftKey) {
                const input = <HTMLTextAreaElement>document.getElementById('chatInput');
                this.content = `${this.content.slice(0, input.selectionStart)}\n${this.content.slice(input.selectionStart)}`;
                this.updateInputHeight();
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
            const input = <HTMLTextAreaElement>document.getElementById('chatInput');
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
        const inputElement = <HTMLElement>document.querySelector('#chatInput');
        inputElement.addEventListener('input', () => {
            inputElement.style.height = 'auto';
            inputElement.style.height = (inputElement.scrollHeight) + 'px';
            this.chatInputHeight = inputElement.scrollHeight;
            if (document.querySelector('#scrollDown')) {
                (<HTMLElement>document.querySelector('#scrollDown')).style.bottom = inputElement.scrollHeight + 46 + 'px';
            }
        });

        this.route.params
            .pipe(
                switchMap((params: Params) => {
                    if (!this.uploadService.talkingDestroyed) {
                        this.destroyCurrent();
                    }
                    this.uploadService.talkingDestroyed = false;
                    this.messageService.updateMaxImageWidth();
                    this.conversationID = Number(params.id);
                    this.unread = (params.unread && params.unread <= 50) ? Number(params.unread) : 0;
                    this.load = this.unread < 15 ? 15 : this.unread;
                    if (this.cacheService.cachedData.conversationDetail[this.conversationID]) {
                        this.updateConversation(this.cacheService.cachedData.conversationDetail[this.conversationID]);
                        this.messageService.initMessage(this.conversationID);
                        this.messageService.getMessages(this.unread, this.conversationID, -1, this.load);
                    } else {
                        const listItem = this.cacheService.cachedData.conversations.find(t => t.conversationId === this.conversationID);
                        if (listItem) {
                            this.header.title = listItem.displayName;
                        } else {
                            this.header.title = 'Loading...';
                        }
                    }

                    this.content = localStorage.getItem('draft' + this.conversationID);
                    this.autoSaveInterval = setInterval(() => {
                        if (this.content != null) {
                            localStorage.setItem('draft' + this.conversationID, this.content);
                        }
                    }, 1000);

                    this.updateInputHeight();

                    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                        inputElement.focus();
                    }

                    return this.conversationApiService.ConversationDetail(this.conversationID);
                }),
                map(t => t.value)
            )
            .subscribe(conversation => {
                if (this.conversationID !== conversation.id || this.uploadService.talkingDestroyed) {
                    return;
                }
                this.updateConversation(conversation);
                if (!this.cacheService.cachedData.conversationDetail[this.conversationID]) {
                    this.messageService.initMessage(this.conversationID);
                    this.messageService.getMessages(this.unread, this.conversationID, -1, this.load);
                }
                this.messageService.cleanMessageByTimer();
                this.cacheService.cachedData.conversationDetail[this.conversationID] = conversation;
                this.cacheService.saveCache();
            });
        this.windowInnerHeight = window.innerHeight;
    }

    private updateInputHeight(): void {
        const inputElement = <HTMLElement>document.querySelector('#chatInput');
        setTimeout(() => {
            inputElement.style.height = (inputElement.scrollHeight) + 'px';
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
        this.timerService.updateDestructTime(conversation.maxLiveSeconds);
        this.header.timer = this.timerService.destructTime !== 'off';
    }

    public trackByMessages(_index: number, message: Message): number {
        return message.id;
    }

    public LoadMore(): void {
        this.messageService.loadMore();
    }

    public send(): void {
        if (this.content.trim().length === 0) {
            return;
        }
        const tempMessage = new Message();
        tempMessage.isEmoji = this.messageService.checkEmoji(this.content);
        tempMessage.content = he.encode(this.content);
        tempMessage.content = Autolinker.link(tempMessage.content, {
            stripPrefix: false,
            className: 'chat-inline-link'
        });
        const messageIDArry = this.messageService.getAtIDs(this.content);
        tempMessage.content = messageIDArry[0];
        tempMessage.senderId = this.cacheService.cachedData.me.id;
        tempMessage.sender = this.cacheService.cachedData.me;
        tempMessage.local = true;
        this.messageService.localMessages.push(tempMessage);
        setTimeout(() => {
            this.uploadService.scrollBottom(true);
        }, 0);
        const _this = this;
        const encryptedMessage = AES.encrypt(this.content, this.messageService.conversation.aesKey).toString();
        this.conversationApiService.SendMessage(this.messageService.conversation.id, encryptedMessage, messageIDArry.slice(1))
            .subscribe({
                error(e) {
                    if (e.status === 0 || e.status === 503) {
                        const unsentMessages = new Map(JSON.parse(localStorage.getItem('unsentMessages')));
                        if (unsentMessages.get(_this.conversationID) &&
                            (<Array<string>>unsentMessages.get(_this.conversationID)).length > 0) {
                            const tempArray = <Array<string>>unsentMessages.get(_this.conversationID);
                            tempArray.push(encryptedMessage);
                            unsentMessages.set(_this.conversationID, tempArray);
                        } else {
                            unsentMessages.set(_this.conversationID, [encryptedMessage]);
                        }
                        localStorage.setItem('unsentMessages', JSON.stringify(Array.from(unsentMessages)));
                    }
                }
            });
        this.content = '';
        const inputElement = <HTMLTextAreaElement>document.querySelector('#chatInput');
        inputElement.focus();
        inputElement.style.height = 34 + 'px';
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
            document.querySelector('.message-list').classList.add('active-list');
            window.scroll(0, window.scrollY + 105);
        } else {
            document.querySelector('.message-list').classList.remove('active-list');
            if (this.messageService.belowWindowPercent <= 0.2) {
                this.uploadService.scrollBottom(false);
            } else {
                window.scroll(0, window.scrollY - 105);
            }
        }
    }

    public uploadInput(fileType: number): void {
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
            this.uploadService.upload(files, this.messageService.conversation.id, this.messageService.conversation.aesKey, fileType);
        }
    }

    public paste(event: ClipboardEvent): void {
        const items = event.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                this.preventDefault(event);
                const originalFile = items[i].getAsFile();
                const blob = new File([originalFile],
                    `clipboardImg_${new Date().getTime()}.${originalFile.name.substring(originalFile.name.lastIndexOf('.') + 1)}`);
                if (blob != null) {
                    const urlString = URL.createObjectURL(blob);
                    Swal.fire({
                        title: 'Are you sure to post this image?',
                        imageUrl: urlString,
                        showCancelButton: true
                    }).then((send) => {
                        if (send.value) {
                            this.uploadService.upload(blob, this.messageService.conversation.id,
                                this.messageService.conversation.aesKey, 0);
                        }
                        URL.revokeObjectURL(urlString);
                    });
                }
            }
        }
    }

    public drop(event: DragEvent): void {
        this.preventDefault(event);
        if (event.dataTransfer.items != null) {
            const items = event.dataTransfer.items;
            for (let i = 0; i < items.length; i++) {
                const blob = items[i].getAsFile();
                if (blob != null) {
                    this.uploadService.upload(blob, this.messageService.conversation.id, this.messageService.conversation.aesKey, 2);
                }
            }
        } else {
            const files = event.dataTransfer.files;
            for (let i = 0; i < files.length; i++) {
                const blob = files[i];
                if (blob != null) {
                    this.uploadService.upload(blob, this.messageService.conversation.id, this.messageService.conversation.aesKey, 2);
                }
            }
        }
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
            navigator.mediaDevices.getUserMedia({audio: true})
                .then(stream => {
                    this.recording = true;
                    this.mediaRecorder = new MediaRecorder(stream);
                    this.mediaRecorder.start();
                    const audioChunks = [];
                    this.mediaRecorder.addEventListener('dataavailable', event => {
                        audioChunks.push(event.data);
                    });
                    this.mediaRecorder.addEventListener('stop', () => {
                        this.recording = false;
                        const audioBlob = new File(audioChunks, `voiceMsg_${new Date().getTime()}.opus`);
                        this.uploadService.upload(audioBlob, this.conversationID, this.messageService.conversation.aesKey, 3);
                        clearTimeout(this.forceStopTimeout);
                        stream.getTracks().forEach(track => track.stop());
                    });
                    this.forceStopTimeout = setTimeout(() => {
                        this.mediaRecorder.stop();
                    }, 1000 * 60 * 5);
                }, () => {
                    return;
                });
        }
    }

    public complete(nickname: string): void {
        const input = <HTMLTextAreaElement>document.getElementById('chatInput');
        const typingWords = this.content.slice(0, input.selectionStart).split(/\s|\n/);
        const typingWord = typingWords[typingWords.length - 1];
        const before = this.content.slice(0, input.selectionStart - typingWord.length + typingWord.indexOf('@'));
        this.content =
            `${before}@${nickname.replace(/ /g, '')} ${this.content.slice(input.selectionStart)}`;
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
        this.uploadService.talkingDestroyed = true;
        this.content = null;
        this.showPanel = null;
        this.messageService.resetVariables();
        this.conversationID = null;
        clearInterval(this.autoSaveInterval);
        this.autoSaveInterval = null;
    }


    public shareToOther(message: string): void {
        this.router.navigate(['share-target', {message: message}]);
    }

    public getAtListMaxHeight(): number {
        return window.innerHeight - this.chatInputHeight - 106;
    }

    public shareClick(msg: Message): void {
        if (msg.contentRaw.startsWith('[user]') && msg.relatedData) {
            this.router.navigate(['user', (<KahlaUser>msg.relatedData).id]);
        } else if (msg.contentRaw.startsWith('[group]') && msg.relatedData) {
            const group = <GroupsResult>msg.relatedData;
            this.friendshipService.joinGroup(group, true);
        }
    }
}
