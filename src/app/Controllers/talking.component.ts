import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiService } from '../Services/ApiService';
import { Location } from '@angular/common';
import { KahlaUser } from '../Models/KahlaUser';
import { Message } from '../Models/Message';
import { Conversation } from '../Models/Conversation';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header.component';

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

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private apiService: ApiService
    ) {
        AppComponent.CurrentTalking = this;
    }

    public ngOnInit(): void {
        this.route.params
            .switchMap((params: Params) => this.apiService.ConversationDetail(+params['id']))
            .map(t => t.value)
            .subscribe(conversation => {
                this.conversation = conversation;
                AppComponent.CurrentHeader.title = conversation.displayName;
                if (conversation.anotherUserId) {
                    AppComponent.CurrentHeader.RouterLink = `/kahla/user/${this.conversation.anotherUserId}`;
                } else {
                    AppComponent.CurrentHeader.ButtonIcon = `users`;
                    AppComponent.CurrentHeader.RouterLink = `/kahla/group/${this.conversation.id}`;
                }
            });
        this.route.params.subscribe((params: Params) => {
            this.getMessages(true, +params['id']);
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
            .map(t => t.items)
            .subscribe(messages => {
                this.messages = messages;
                if (getDown) {
                    setTimeout(() => {
                        const h = document.documentElement.scrollHeight || document.body.scrollHeight;
                        window.scrollTo(h, h);
                    }, 0);
                } else {
                    setTimeout(() => {
                        const model = AppComponent.CurrentTalking;
                        window.scroll(0, model.mainList.nativeElement.offsetHeight - model.currentHeight);
                        model.loadingMore = false;
                    }, 0);
                }
            });
    }

    public uploadImage(): void {
        if (this.imageInput) {
            const fileBrowser = this.imageInput.nativeElement;
            if (fileBrowser.files && fileBrowser.files[0]) {
                const formData = new FormData();
                formData.append('image', fileBrowser.files[0]);
                this.apiService.UploadFile(formData).subscribe(response => {
                        alert(response.message);
                        this.apiService.SendMessage(this.conversation.id, `[img]${response.value}`)
                            .subscribe(t => {
                                this.showPanel = !this.showPanel;
                            });
                });
            }
        }
    }

    public uploadFile(): void {
        if (this.fileInput) {
            const fileBrowser = this.fileInput.nativeElement;
            if (fileBrowser.files && fileBrowser.files[0]) {
                const formData = new FormData();
                formData.append('image', fileBrowser.files[0]);
                this.apiService.UploadFile(formData).subscribe(response => {
                        this.apiService.SendMessage(this.conversation.id, `[file]${response.value}`)
                            .subscribe(t => {
                                this.showPanel = !this.showPanel;
                            });
                });
            }
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
        tempMessage.sendTime = Date.now();
        tempMessage.local = true;
        this.messages.push(tempMessage);
        this.messageAmount++;
        this.apiService.SendMessage(this.conversation.id, this.content)
            .subscribe(t => { });
        this.content = '';
        setTimeout(() => {
            const h = document.documentElement.scrollHeight || document.body.scrollHeight;
            window.scrollTo(h, h);
        }, 0);
    }

    public startInput(): void {
        this.showPanel = false;
        setTimeout(() => {
            const h = document.documentElement.scrollHeight || document.body.scrollHeight;
            window.scrollTo(h, h);
        }, 300);
    }

    public togglePanel(): void {
        this.showPanel = !this.showPanel;
        if (this.showPanel) {
            setTimeout(() => {
                const h = document.documentElement.scrollHeight || document.body.scrollHeight;
                window.scroll(0, h);
            }, 0);
        }
    }

    public LoadMore(): void {
        this.loadingMore = true;
        this.currentHeight = this.mainList.nativeElement.offsetHeight;
        this.messageAmount += 15;
        this.getMessages(false, this.conversation.id);
    }

    public ngOnDestroy(): void {
        AppComponent.CurrentTalking = null;
        window.onscroll = null;
    }
}
