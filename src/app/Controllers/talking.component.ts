import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ApiService } from '../Services/ApiService';
import { Message } from '../Models/Message';
import { Conversation } from '../Models/Conversation';
import { AppComponent } from './app.component';
import { switchMap, map } from 'rxjs/operators';
import { AES, enc } from 'crypto-js';
import * as Autolinker from 'autolinker';
import Swal from 'sweetalert2';

@Component({
    templateUrl: '../Views/talking.html',
    styleUrls: ['../Styles/talking.css']
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

    public currentHeight: number;
    public loadingMore = false;
    public progress = 0;
    public uploading = false;
    private colors = ['aqua', 'aquamarine', 'bisque', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chocolate',
        'coral', 'cornflowerblue', 'darkcyan', 'darkgoldenrod', ];
    public userNameColors = new Map();
    private option = { month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: 'numeric' };

    constructor(
        private route: ActivatedRoute,
        private apiService: ApiService
    ) {
        AppComponent.CurrentTalking = this;
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
                    t.sendTime = new Date(t.sendTime).toLocaleString([], this.option);
                });
                this.messages = messages;
                if (getDown) {
                    setTimeout(() => {
                        this.scrollBottom(true);
                    }, 0);
                } else {
                    setTimeout(() => {
                        const model = AppComponent.CurrentTalking;
                        window.scroll(0, model.mainList.nativeElement.offsetHeight - model.currentHeight);
                        model.loadingMore = false;
                    }, 300);
                }
            });
    }

    public uploadInput(image: boolean): void {
        if (this.fileInput && !image) {
            this.showPanel = !this.showPanel;
            const fileBrowser = this.fileInput.nativeElement;
            if (fileBrowser.files && fileBrowser.files[0]) {
                const formData = new FormData();
                formData.append('image', fileBrowser.files[0]);
                this.upload(image, formData);
            }
        }
        if (this.imageInput && image) {
            this.showPanel = !this.showPanel;
            const fileBrowser = this.imageInput.nativeElement;
            if (fileBrowser.files && fileBrowser.files[0]) {
                const formData = new FormData();
                formData.append('image', fileBrowser.files[0]);
                this.upload(image, formData);
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
        tempMessage.senderId = AppComponent.me.id;
        tempMessage.sendTime = new Date(Date.now()).toLocaleString([], this.option);
        tempMessage.local = true;
        this.messages.push(tempMessage);
        this.messageAmount++;
        this.content = AES.encrypt(this.content, this.conversation.aesKey).toString();
        this.apiService.SendMessage(this.conversation.id, this.content)
            .subscribe(() => { });
        this.content = '';
        this.scrollBottom(true);
    }

    public startInput(): void {
        this.showPanel = false;
        setTimeout(() => {
            this.scrollBottom(true);
        }, 300);
    }

    public togglePanel(): void {
        this.showPanel = !this.showPanel;
        if (this.showPanel) {
            setTimeout(() => {
                this.scrollBottom(false);
            }, 0);
        }
    }

    public LoadMore(): void {
        this.loadingMore = true;
        this.currentHeight = this.mainList.nativeElement.offsetHeight;
        this.messageAmount += 15;
        this.getMessages(false, this.conversation.id);
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
                            this.upload(true, formData);
                        }
                        URL.revokeObjectURL(urlString);
                    });
                }
            }
        }
    }

    private upload(image: boolean, file: FormData): void {
        this.uploading = true;
        this.apiService.UploadFile(file).subscribe(response => {
            if (Number(response)) {
                this.progress = <number>response;
            } else if (response != null) {
                let encedMessages;
                if (image) {
                    encedMessages = AES.encrypt(`[img]${response}`, this.conversation.aesKey).toString();
                } else {
                    encedMessages = AES.encrypt(`[file]${response}`, this.conversation.aesKey).toString();
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
                if (items[i].type.match('^image') && blob != null) {
                    formData.append('image', blob);
                    this.upload(true, formData);
                } else if (blob != null) {
                    formData.append('file', blob);
                    this.upload(false, formData);
                }
            }
        } else {
            const files = event.dataTransfer.files;
            for (let i = 0; i < files.length; i++) {
                const blob = files[i];
                const formData = new FormData();
                if (files[i].type.match('^image') && blob != null) {
                    formData.append('image', blob);
                    this.upload(true, formData);
                } else if (blob != null) {
                    formData.append('file', blob);
                    this.upload(false, formData);
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
