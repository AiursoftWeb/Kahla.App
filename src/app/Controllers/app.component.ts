import { Component, OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import { ApiService } from '../Services/ApiService';
import { Router } from '@angular/router';
import { KahlaUser } from '../Models/KahlaUser';
import { Location } from '@angular/common';
import { AiurValue } from '../Models/AiurValue';
import { InitPusherViewModel } from '../Models/ApiModels/InitPusherViewModel';
import { AiurEvent } from '../Models/AiurEvent';
import { EventType } from '../Models/EventType';
import { NewMessageEvent } from '../Models/NewMessageEvent';
import { NewFriendRequest } from '../Models/NewFriendRequest';
import { ConversationsComponent } from './conversations.component';
import { TalkingComponent } from './talking.component';
import { FriendsComponent } from './friends.component';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/Rx';
import { NavComponent } from './nav.component';
import { HeaderComponent } from './header.component';
import { FriendRequestsComponent } from './friendrequests.component';
import { CacheModel } from '../Models/CacheModel';
import { Notify } from '../Services/Notify';
import { CacheService } from '../Services/CacheService';
import { GlobalValue } from '../Services/GlobalValue';
import { environment } from '../../environments/environment';
import 'sweetalert';

@Component({
    selector: 'app-kahla',
    templateUrl: '../Views/app.html',
    styleUrls: ['../Styles/app.css']
})
export class AppComponent implements OnInit, OnDestroy {
    public static me: KahlaUser;
    public static CurrentHeader: HeaderComponent;
    public static CurrentNav: NavComponent;
    public static CurrentTalking: TalkingComponent;
    public static CurrentConversation: ConversationsComponent;
    public static CurrentFriend: FriendsComponent;
    public static CurrentApp: AppComponent;
    public static CurrentFriendRequests: FriendRequestsComponent;
    public ws: WebSocket;
    public wsconnected = false;
    constructor(
        private apiService: ApiService,
        private router: Router,
        private notify: Notify,
        private location: Location,
        private cache: CacheService) {
        AppComponent.CurrentApp = this;
    }

    public ngOnInit(): void {
        // if (environment.production && location.protocol !== 'https:') {
        //     location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
        // }
        GlobalValue.Credential = localStorage.getItem('cred');
        this.apiService.SignInStatus().subscribe(signInStatus => {
            if (signInStatus.value === false) {
                this.router.navigate(['/kahla/signin']);
            } else {
                this.apiService.Me().subscribe(p => {
                    AppComponent.me = p.value;
                });
                this.cache.AutoUpdateConversations(AppComponent.CurrentNav);
                this.LoadPusher();
            }
        });
    }

    public LoadPusher(): void {
        this.apiService.InitPusher().subscribe(model => {
            this.ws = new WebSocket(model.serverPath);
            this.ws.onopen = () => this.wsconnected = true;
            this.ws.onmessage = this.OnMessage;
            this.ws.onerror = this.OnError;
            this.ws.onclose = this.OnError;
            if ('Notification' in window) {
                Notification.requestPermission();
            }
        });
    }

    public Reconnect(): void {
        this.ngOnInit();
        if (AppComponent.CurrentConversation) {
            AppComponent.CurrentConversation.ngOnInit();
        } else if (AppComponent.CurrentFriend) {
            AppComponent.CurrentFriend.ngOnInit();
        } else if (AppComponent.CurrentTalking) {
            AppComponent.CurrentTalking.getMessages(true, AppComponent.CurrentTalking.conversation.id);
        }
    }

    public OnMessage(data: MessageEvent): void {
        const ev = JSON.parse(data.data) as AiurEvent;
        switch (ev.type) {
            case EventType.NewMessage:
                const evt = ev as NewMessageEvent;
                if (AppComponent.CurrentTalking && AppComponent.CurrentTalking.conversation.id === evt.conversationId) {
                    AppComponent.CurrentApp.notify.ShowNewMessage(evt, AppComponent.me.id);
                    AppComponent.CurrentTalking.getMessages(true, AppComponent.CurrentTalking.conversation.id);
                } else if (AppComponent.CurrentConversation) {
                    AppComponent.CurrentConversation.ngOnInit();
                    AppComponent.CurrentApp.notify.ShowNewMessage(evt, AppComponent.me.id);
                } else {
                    AppComponent.CurrentApp.cache.AutoUpdateUnread(AppComponent.CurrentNav);
                    AppComponent.CurrentApp.notify.ShowNewMessage(evt, AppComponent.me.id);
                }
                break;
            case EventType.NewFriendRequest:
                const nvt = ev as NewFriendRequest;
                swal('Friend request', 'You have got a new friend request!', 'info');
                if (AppComponent.CurrentFriendRequests) {
                    AppComponent.CurrentFriendRequests.ngOnInit();
                } else {
                    AppComponent.CurrentApp.cache.AutoUpdateConversations(AppComponent.CurrentNav);
                }
                break;
            case EventType.WereDeletedEvent:
                swal('Were deleted', 'You were deleted by one of your friends from his friend list.', 'info');
                if (AppComponent.CurrentConversation) {
                    AppComponent.CurrentConversation.ngOnInit();
                } else if (AppComponent.CurrentFriend) {
                    AppComponent.CurrentFriend.ngOnInit();
                } else {
                    AppComponent.CurrentApp.cache.AutoUpdateUnread(AppComponent.CurrentNav);
                }
                break;
            case EventType.FriendAcceptedEvent:
                swal('Friend request', 'Your friend request was accepted!', 'success');
                if (AppComponent.CurrentConversation) {
                    AppComponent.CurrentConversation.ngOnInit();
                } else if (AppComponent.CurrentFriend) {
                    AppComponent.CurrentFriend.ngOnInit();
                }
                break;
        }
    }

    public destory(): void {
        if (this.ws !== null && this.ws !== undefined) {
            this.ws.onclose = function () { };
            this.ws.onmessage = function () { };
            this.ws.close();
            this.ws = null;
        }
        this.wsconnected = false;
    }

    public OnError(): void {

    }

    public ngOnDestroy(): void {
        AppComponent.CurrentApp = null;
    }
}
