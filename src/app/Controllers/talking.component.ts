import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ApiService } from '../Services/ApiService';
import { Message } from '../Models/Message';
import { Conversation } from '../Models/Conversation';
import { AppComponent } from './app.component';
import { switchMap, map } from 'rxjs/operators';
import { AES, enc } from 'crypto-js';
import * as Autolinker from 'autolinker';
import Swal from 'sweetalert2';
import { Values } from '../values';
import { UploadService } from '../Services/UploadService';

@Component({
    templateUrl: '../Views/talking.html',
    styleUrls: ['../Styles/talking.css',
                '../Styles/button.css',
                '../Styles/reddot.css']
})
export class TalkingComponent implements OnInit, OnDestroy {
    public conversation: Conversation;
    public content: string;
    public localMessages: Message[];
    public messageAmount = 15;
    public showPanel = false;
    @ViewChild('mainList') public mainList: ElementRef;
    @ViewChild('imageInput') public imageInput;
    @ViewChild('fileInput') public fileInput;

    public loadingMore = false;
    private colors = ['aqua', 'aquamarine', 'bisque', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chocolate',
        'coral', 'cornflowerblue', 'darkcyan', 'darkgoldenrod'];
    public userNameColors = new Map();
    public loadingImgURL = Values.loadingImgURL;
    public belowWindowPercent = 0;
    public newMessages = false;
    public noMoreMessages = true;
    private oldOffsetHeight: number;

    constructor(
        private route: ActivatedRoute,
        private apiService: ApiService,
        public uploadService: UploadService
    ) {
        AppComponent.CurrentTalking = this;
    }

    @HostListener('window:scroll', [])
    onScroll() {
        this.belowWindowPercent = (document.documentElement.offsetHeight - document.documentElement.scrollTop
            - window.innerHeight) / window.innerHeight;
        if (this.belowWindowPercent <= 0) {
            this.newMessages = false;
        }
    }

    public ngOnInit(): void {
        this.route.params
            .pipe(
                switchMap((params: Params) => this.apiService.ConversationDetail(+params['id'])),
                map(t => t.value)
            )
            .subscribe(conversation => {
                this.conversation = conversation;
                AppComponent.CurrentHeader.title = conversation.displayName;
                document.querySelector('app-header').setAttribute('title', conversation.displayName);
                this.route.params.subscribe((params: Params) => {
                    this.getMessages(true, params['id']);
                });
                if (conversation.anotherUserId) {
                    AppComponent.CurrentHeader.RouterLink = `/kahla/user/${this.conversation.anotherUserId}`;
                } else {
                    AppComponent.CurrentHeader.ButtonIcon = `users`;
                    AppComponent.CurrentHeader.RouterLink = `/kahla/group/${this.conversation.id}`;
                }
            });
    }

    public myId(): string {
        if (AppComponent.me) {
            return AppComponent.me.id;
        } else {
            return null;
        }
    }

    public getMessages(getDown: boolean, id: number): void {
        this.apiService.GetMessage(id, this.messageAmount)
            .pipe(
                map(t => t.items)
            )
            .subscribe(messages => {
                messages.forEach(t => {
                    t.content = AES.decrypt(t.content, this.conversation.aesKey).toString(enc.Utf8);
                    if (t.content.startsWith('[file]') || t.content.startsWith('[video]')) {
                        const filekey = this.uploadService.getFileKey(t.content);
                        if (filekey !== -1 && !isNaN(filekey) && filekey !== 0) {
                            this.apiService.GetFileURL(filekey).subscribe(response => {
                                if (response.code === 0) {
                                    if (t.content.startsWith('[file]')) {
                                        t.content += '-' + response.downloadPath;
                                    } else {
                                        t.content = '[video]' + response.downloadPath;
                                    }
                                }
                            });
                        }
                    } else if (!t.content.startsWith('[img]')) {
                        // replace URLs to links
                        t.content = Autolinker.link(t.content, { newWindow: true });
                    }
                    if (this.conversation.discriminator === 'GroupConversation' && t.senderId !== this.myId() &&
                        !this.userNameColors.has(t.senderId)) {
                        this.userNameColors.set(t.senderId, this.colors[Math.floor(Math.random() * this.colors.length)]);
                    }
                    t.sender.avatarURL = Values.fileAddress + t.sender.headImgFileKey;
                });
                if (messages.length < 15) {
                    this.noMoreMessages = true;
                } else {
                    this.noMoreMessages = false;
                }
                if (typeof this.localMessages !== 'undefined' && this.localMessages.length > 0 && messages.length > 0) {
                    if (!getDown && messages[0].id === this.localMessages[0].id) {
                        this.noMoreMessages = true;
                    }
                    if (messages[messages.length - 1].senderId !== AppComponent.me.id && messages[messages.length - 1].id !==
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
                    }, 10);
                } else if (!getDown) {
                    this.loadingMore = false;
                    setTimeout(() => {
                        window.scroll(0, document.documentElement.offsetHeight - this.oldOffsetHeight);
                    }, 0);
                }
            });
    }

    public trackByMessages(_index: number, message: Message): number {
        return message.id;
    }

    public LoadMore(): void {
        if (!this.noMoreMessages) {
            this.loadingMore = true;
            this.oldOffsetHeight = document.documentElement.offsetHeight;
            this.messageAmount += 15;
            this.getMessages(false, this.conversation.id);
        }
    }

    public send(): void {
        if (this.content.trim().length === 0) {
            return;
        }
        const tempMessage = new Message();
        tempMessage.content = this.content;
        tempMessage.sender = AppComponent.me;
        tempMessage.sender.avatarURL = Values.fileAddress + AppComponent.me.headImgFileKey;
        tempMessage.senderId = AppComponent.me.id;
        tempMessage.local = true;
        this.localMessages.push(tempMessage);
        setTimeout(() => {
            this.uploadService.scrollBottom(true);
        }, 0);
        this.content = AES.encrypt(this.content, this.conversation.aesKey).toString();
        this.apiService.SendMessage(this.conversation.id, this.content)
            .subscribe(() => {});
        this.content = '';
        document.getElementById('chatInput').focus();
    }

    public startInput(): void {
        if (this.showPanel) {
            this.showPanel = false;
            document.querySelector('.message-list').classList.remove('active-list');
            if (this.belowWindowPercent > 0) {
                window.scroll(0, document.documentElement.scrollTop - 105);
            }
        }
    }

    public togglePanel(): void {
        this.showPanel = !this.showPanel;
        if (this.showPanel) {
            if (this.belowWindowPercent <= 0) {
                document.querySelector('.message-list').classList.add('active-list');
            }
            window.scroll(0, document.documentElement.scrollTop + 105);
        } else {
            document.querySelector('.message-list').classList.remove('active-list');
            if (this.belowWindowPercent <= 0) {
                this.uploadService.scrollBottom(false);
            } else {
                window.scroll(0, document.documentElement.scrollTop - 105);
            }
        }
    }

    public uploadInput(): void {
        this.showPanel = false;
        document.querySelector('.message-list').classList.remove('active-list');
        let files;
        if (this.fileInput.nativeElement.files.length > 0) {
            files = this.fileInput.nativeElement.files[0];
        }
        if (this.imageInput.nativeElement.files.length > 0) {
            files = this.imageInput.nativeElement.files[0];
        }
        if (files) {
            this.uploadService.upload(files, this.conversation.id, this.conversation.aesKey);
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
                            this.uploadService.upload(blob, this.conversation.id, this.conversation.aesKey);
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
                    this.uploadService.upload(blob, this.conversation.id, this.conversation.aesKey);
                }
            }
        } else {
            const files = event.dataTransfer.files;
            for (let i = 0; i < files.length; i++) {
                const blob = files[i];
                if (blob != null) {
                    this.uploadService.upload(blob, this.conversation.id, this.conversation.aesKey);
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

    public ngOnDestroy(): void {
        AppComponent.CurrentTalking = null;
        window.onscroll = null;
    }
}
