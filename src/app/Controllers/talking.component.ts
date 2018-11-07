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
        this.messageService.belowWindowPercent = (document.documentElement.offsetHeight - document.documentElement.scrollTop
            - window.innerHeight) / window.innerHeight;
        if (this.messageService.belowWindowPercent <= 0) {
            this.messageService.newMessages = false;
        }
    }

    public ngOnInit(): void {
        this.headerService.title = 'Loading...';
        this.headerService.returnButton = true;
        this.route.params
            .pipe(
                switchMap((params: Params) => this.conversationApiService.ConversationDetail(+params['id'])),
                map(t => t.value)
            )
            .subscribe(conversation => {
                MessageService.conversation = conversation;
                document.querySelector('app-header').setAttribute('title', conversation.displayName);
                this.route.params.subscribe((params: Params) => {
                    this.messageService.getMessages(true, params['id']);
                });
                this.headerService.title = conversation.displayName;
                this.headerService.button = true;
                if (conversation.anotherUserId) {
                    this.headerService.buttonIcon = 'user';
                    this.headerService.routerLink = `/kahla/user/${conversation.anotherUserId}`;
                } else {
                    this.headerService.buttonIcon = `users`;
                    this.headerService.routerLink = `/kahla/group/${conversation.id}`;
                }
            });
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
        tempMessage.content = this.content;
        tempMessage.sender = this.messageService.me;
        tempMessage.sender.avatarURL = Values.fileAddress + this.messageService.me.headImgFileKey;
        tempMessage.senderId = this.messageService.me.id;
        tempMessage.local = true;
        this.messageService.localMessages.push(tempMessage);
        setTimeout(() => {
            this.uploadService.scrollBottom(true);
        }, 0);
        this.content = AES.encrypt(this.content, MessageService.conversation.aesKey).toString();
        this.conversationApiService.SendMessage(MessageService.conversation.id, this.content)
            .subscribe(() => {});
        this.content = '';
        document.getElementById('chatInput').focus();
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
            this.uploadService.upload(files, MessageService.conversation.id, MessageService.conversation.aesKey, fileType);
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
                            this.uploadService.upload(blob, MessageService.conversation.id,
                                MessageService.conversation.aesKey, 0);
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
                    this.uploadService.upload(blob, MessageService.conversation.id, MessageService.conversation.aesKey, 2);
                }
            }
        } else {
            const files = event.dataTransfer.files;
            for (let i = 0; i < files.length; i++) {
                const blob = files[i];
                if (blob != null) {
                    this.uploadService.upload(blob, MessageService.conversation.id, MessageService.conversation.aesKey, 2);
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
        window.onscroll = null;
        this.content = null;
        this.showPanel = null;
        this.messageService.localMessages = [];
    }
}
