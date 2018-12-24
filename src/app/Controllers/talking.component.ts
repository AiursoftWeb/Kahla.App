import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ConversationApiService } from '../Services/ConversationApiService';
import { Message } from '../Models/Message';
import { switchMap, map } from 'rxjs/operators';
import { AES } from 'crypto-js';
import Swal from 'sweetalert2';
import { Values } from '../values';
import { UploadService } from '../Services/UploadService';
import { MessageService } from '../Services/MessageService';
import { HeaderService } from '../Services/HeaderService';
import * as he from 'he';
import * as Autolinker from 'autolinker';
declare var MediaRecorder: any;

@Component({
    templateUrl: '../Views/talking.html',
    styleUrls: ['../Styles/talking.css',
                '../Styles/button.css',
                '../Styles/reddot.css']
})
export class TalkingComponent implements OnInit, OnDestroy {
    public content: string;
    public showPanel = false;
    public loadingImgURL = Values.loadingImgURL;
    private windowInnerHeight = 0;
    private formerWindowInnerHeight = 0;
    private keyBoardHeight = 0;
    private colors = ['aqua', 'aquamarine', 'bisque', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chocolate',
        'coral', 'cornflowerblue', 'darkcyan', 'darkgoldenrod'];
    public users = new Map();
    public fileAddress = Values.fileAddress;
    private conversationID = 0;
    public autoSaveInterval;
    public recording = false;
    private mediaRecorder;
    private forceStopTimeout;
    private oldContent: string;

    @ViewChild('mainList') public mainList: ElementRef;
    @ViewChild('imageInput') public imageInput;
    @ViewChild('videoInput') public videoInput;
    @ViewChild('fileInput') public fileInput;

    constructor(
        private route: ActivatedRoute,
        private conversationApiService: ConversationApiService,
        public uploadService: UploadService,
        public messageService: MessageService,
        private headerService: HeaderService
    ) {}

    @HostListener('window:scroll', [])
    onScroll() {
        this.messageService.updateBelowWindowPercent();
        if (this.messageService.belowWindowPercent <= 0) {
            this.messageService.newMessages = false;
        }
    }

    @HostListener('window:resize', [])
    onResize() {
        this.messageService.updateMaxImageWidth();
        if (window.innerHeight < this.windowInnerHeight) {
            this.keyBoardHeight = this.windowInnerHeight - window.innerHeight;
            window.scroll(0, document.documentElement.scrollTop + this.keyBoardHeight);
        } else if (window.innerHeight - this.formerWindowInnerHeight > 100 && this.messageService.belowWindowPercent > 0.2) {
            window.scroll(0, document.documentElement.scrollTop - this.keyBoardHeight);
        } else if (window.innerHeight - this.formerWindowInnerHeight > 100) {
            window.scroll(0, document.documentElement.scrollTop);
        }
        this.formerWindowInnerHeight = window.innerHeight;
    }

    @HostListener('keydown', ['$event'])
    onKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.oldContent = this.content;
        }
    }

    @HostListener('keyup', ['$event'])
    onKeyup(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (this.oldContent === this.content) {
                this.send();
            }
        }
    }

    public ngOnInit(): void {
        this.uploadService.talkingDestroyed = false;
        this.messageService.updateMaxImageWidth();
        this.headerService.title = 'Loading...';
        this.headerService.returnButton = true;
        this.headerService.shadow = true;
        this.route.params
            .pipe(
                switchMap((params: Params) => {
                    this.conversationID = params['id'];
                    return this.conversationApiService.ConversationDetail(this.conversationID);
                }),
                map(t => t.value)
            )
            .subscribe(conversation => {
                if (!this.uploadService.talkingDestroyed) {
                    if (conversation.discriminator === 'GroupConversation') {
                        conversation.users.forEach(user => {
                            this.users.set(user.user.id, [user.user.nickName, Values.fileAddress + user.user.headImgFileKey,
                                this.colors[Math.floor(Math.random() * this.colors.length)]]);
                        });
                    }
                    this.messageService.conversation = conversation;
                    document.querySelector('app-header').setAttribute('title', conversation.displayName);
                    this.messageService.getMessages(true, this.conversationID);
                    this.headerService.title = conversation.displayName;
                    this.headerService.button = true;
                    if (conversation.anotherUserId) {
                        this.headerService.buttonIcon = 'user';
                        this.headerService.routerLink = `/user/${conversation.anotherUserId}`;
                    } else {
                        this.headerService.buttonIcon = `users`;
                        this.headerService.routerLink = `/group/${conversation.id}`;
                    }

                    this.content = localStorage.getItem('draft' + this.conversationID);

                    this.autoSaveInterval = setInterval(() => {
                        if (this.content != null) {
                            localStorage.setItem('draft' + this.conversationID, this.content);
                        }
                    }, 1000);

                    const inputElement = <HTMLElement>document.querySelector('#chatInput');

                    setTimeout(() => {
                        inputElement.style.height = (inputElement.scrollHeight) + 'px';
                    }, 0);

                    inputElement.addEventListener('input', () => {
                        inputElement.style.height = 'auto';
                        inputElement.style.height = (inputElement.scrollHeight) + 'px';
                        if (document.querySelector('#scrollDown')) {
                            (<HTMLElement>document.querySelector('#scrollDown')).style.bottom = inputElement.scrollHeight + 46 + 'px';
                        }
                    });
                }
            });
        this.windowInnerHeight = window.innerHeight;
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
        tempMessage.content = he.encode(this.content);
        tempMessage.content = Autolinker.link(tempMessage.content, { stripPrefix: false});
        tempMessage.senderId = this.messageService.me.id;
        tempMessage.local = true;
        this.messageService.localMessages.push(tempMessage);
        setTimeout(() => {
            this.uploadService.scrollBottom(true);
        }, 0);
        const encryptedMessage = AES.encrypt(this.content, this.messageService.conversation.aesKey).toString();
        this.conversationApiService.SendMessage(this.messageService.conversation.id, encryptedMessage)
            .subscribe(() => {}, () => {
                const unsentMessages = new Map(JSON.parse(localStorage.getItem('unsentMessages')));
                if (unsentMessages.get(this.conversationID) && (<Array<string>>unsentMessages.get(this.conversationID)).length > 0) {
                    const tempArray = <Array<string>>unsentMessages.get(this.conversationID);
                    tempArray.push(encryptedMessage);
                    unsentMessages.set(this.conversationID, tempArray);
                } else {
                    unsentMessages.set(this.conversationID, [encryptedMessage]);
                }
                localStorage.setItem('unsentMessages', JSON.stringify(Array.from(unsentMessages)));
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
                window.scroll(0, document.documentElement.scrollTop - 105);
            }
        }
    }

    public togglePanel(): void {
        this.showPanel = !this.showPanel;
        if (this.showPanel) {
            document.querySelector('.message-list').classList.add('active-list');
            window.scroll(0, document.documentElement.scrollTop + 105);
        } else {
            document.querySelector('.message-list').classList.remove('active-list');
            if (this.messageService.belowWindowPercent <= 0.2) {
                this.uploadService.scrollBottom(false);
            } else {
                window.scroll(0, document.documentElement.scrollTop - 105);
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
                const blob = items[i].getAsFile();
                if (blob != null) {
                    const urlString = URL.createObjectURL(blob);
                    Swal({
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
            navigator.mediaDevices.getUserMedia({ audio: true })
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
                    const audioBlob = new File(audioChunks, 'audio');
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

    public ngOnDestroy(): void {
        this.uploadService.talkingDestroyed = true;
        window.onscroll = null;
        window.onresize = null;
        this.content = null;
        this.showPanel = null;
        this.messageService.resetVariables();
        this.colors = null;
        this.users = null;
        this.conversationID = null;
        clearInterval(this.autoSaveInterval);
        this.autoSaveInterval = null;
    }
}
