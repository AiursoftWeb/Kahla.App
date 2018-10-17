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
import { UploadFile } from '../Models/UploadFile';
import { Values } from '../values';

@Component({
    templateUrl: '../Views/talking.html',
    styleUrls: ['../Styles/talking.css',
                '../Styles/button.css',
                '../Styles/reddot.css']
})
export class TalkingComponent implements OnInit, OnDestroy {
    public conversation: Conversation;
    public content: string;
    public messages: Message[];
    public messageAmount = 15;
    public showPanel = false;
    @ViewChild('mainList') public mainList: ElementRef;
    @ViewChild('imageInput') public imageInput;
    @ViewChild('fileInput') public fileInput;

    public oldHeight: number;
    public progress = 0;
    public uploading = false;
    private colors = ['aqua', 'aquamarine', 'bisque', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chocolate',
        'coral', 'cornflowerblue', 'darkcyan', 'darkgoldenrod', ];
    public userNameColors = new Map();
    public showScrollDown = false;
    private noMoreMessages = false;

    constructor(
        private route: ActivatedRoute,
        private apiService: ApiService
    ) {
        AppComponent.CurrentTalking = this;
    }

    @HostListener('window:scroll', [])
    onScroll() {
        const belowWindowPercent = (document.documentElement.offsetHeight - document.documentElement.scrollTop
            - window.innerHeight) / window.innerHeight;
        if (belowWindowPercent > 0.8) {
            this.showScrollDown = true;
        } else {
            this.showScrollDown = false;
        }
        if (document.documentElement.scrollTop === 0 && !this.noMoreMessages) {
            this.oldHeight = document.documentElement.offsetHeight;
            this.messageAmount += 15;
            this.getMessages(false, this.conversation.id);
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
                    this.getMessages(true, +params['id']);
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
                    if (!t.content.startsWith('[')) {
                        // replace URLs to links
                        t.content = Autolinker.link(t.content, { newWindow: true });
                    }
                    if (t.senderId !== this.myId() && !this.userNameColors.has(t.senderId)) {
                        this.userNameColors.set(t.senderId, this.colors[Math.floor(Math.random() * this.colors.length)]);
                    }
                    t.sender.avatarURL = Values.fileAddress + t.sender.headImgFileKey;
                });
                if (typeof this.messages !== 'undefined' && messages.length > 0 && messages[0].id === this.messages[0].id) {
                    this.noMoreMessages = true;
                }
                this.messages = messages;
                if (getDown && !this.showScrollDown) {
                    setTimeout(() => {
                        this.scrollBottom(true);
                    }, 100);
                } else if (!getDown) {
                    setTimeout(() => {
                        window.scroll(0, document.documentElement.offsetHeight - this.oldHeight);
                    }, 1);
                }
            });
    }

    public uploadInput(): void {
        if (this.fileInput) {
            this.showPanel = false;
            const fileBrowser = this.fileInput.nativeElement;
            if (fileBrowser.files && fileBrowser.files[0]) {
                const formData = new FormData();
                formData.append('file', fileBrowser.files[0]);
                this.upload(this.getFileType(fileBrowser.files[0]), formData);
            }
        }
        if (this.imageInput) {
            this.showPanel = false;
            const fileBrowser = this.imageInput.nativeElement;
            if (fileBrowser.files && fileBrowser.files[0]) {
                const formData = new FormData();
                formData.append('image', fileBrowser.files[0]);
                this.upload(0, formData);
            }
        }
    }

    private finishUpload() {
        this.uploading = false;
        this.progress = 0;
        this.scrollBottom(true);
    }

    private scrollBottom(smooth: boolean) {
        const h = document.documentElement.scrollHeight || document.body.scrollHeight;
        if (smooth) {
            window.scroll({top: h, behavior: 'smooth'});
        } else {
            window.scroll(0, h);
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
        this.messages.push(tempMessage);
        this.messageAmount++;
        this.content = AES.encrypt(this.content, this.conversation.aesKey).toString();
        this.apiService.SendMessage(this.conversation.id, this.content)
            .subscribe(() => { });
        this.content = '';
        setTimeout(() => {
            this.scrollBottom(true);
        }, 10);
        document.getElementById('chatInput').focus();
    }

    public startInput(): void {
        this.showPanel = false;
    }

    public togglePanel(): void {
        this.showPanel = !this.showPanel;
        if (this.showPanel) {
            setTimeout(() => {
                this.scrollBottom(false);
            }, 0);
        }
    }

    public paste(event: ClipboardEvent): void {
        const items = event.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                this.preventDefault(event);
                const blob = items[i].getAsFile();
                if (blob != null) {
                    const formData = new FormData();
                    formData.append('image', blob);
                    const urlString = URL.createObjectURL(blob);
                    Swal({
                        title: 'Are you sure to post this image?',
                        imageUrl: urlString,
                        showCancelButton: true
                    }).then((send) => {
                        if (send.value) {
                            this.upload(0, formData);
                        }
                        URL.revokeObjectURL(urlString);
                    });
                }
            }
        }
    }

    private upload(type: number, file: FormData): void {
        this.uploading = true;
        this.apiService.UploadFile(file).subscribe(response => {
            if (Number(response)) {
                this.progress = <number>response;
            } else if (response != null) {
                let encedMessages;
                switch (type) {
                    case 0:
                        encedMessages = AES.encrypt(`[img]${(<UploadFile>response).path}`, this.conversation.aesKey).toString();
                        break;
                    case 1:
                        encedMessages = AES.encrypt(`[video]${(<UploadFile>response).path}`, this.conversation.aesKey).toString();
                        break;
                    case 2:
                        encedMessages = AES.encrypt(`[file]${(<UploadFile>response).path}`, this.conversation.aesKey).toString();
                        break;
                    default:
                        break;
                }
                this.apiService.SendMessage(this.conversation.id, encedMessages)
                    .subscribe(() => {
                        this.finishUpload();
                    });
            }
        });
    }

    public drop(event: DragEvent): void {
        this.preventDefault(event);
        if (event.dataTransfer.items != null) {
            const items = event.dataTransfer.items;
            for (let i = 0; i < items.length; i++) {
                const blob = items[i].getAsFile();
                const formData = new FormData();
                if (blob != null) {
                    formData.append('file', blob);
                    this.upload(this.getFileType(blob), formData);
                }
            }
        } else {
            const files = event.dataTransfer.files;
            for (let i = 0; i < files.length; i++) {
                const blob = files[i];
                const formData = new FormData();
                if (blob != null) {
                    formData.append('file', blob);
                    this.upload(this.getFileType(blob), formData);
                }
            }
        }
        this.removeDragData(event);
    }

    private getFileType(file: Blob): number {
        if (file == null) {
            return -1;
        }
        if (file.type.match('^image')) {
            return 0;
        } else if (file.type.match('^video')) {
            return 1;
        } else {
            return 2;
        }
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
