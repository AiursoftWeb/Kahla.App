import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthApiService } from '../Services/AuthApiService';
import { ContactInfo } from '../Models/ContactInfo';
import { Router } from '@angular/router';
import { AppComponent } from './app.component';
import { CacheService } from '../Services/CacheService';
import { map } from 'rxjs/operators';
import * as PullToRefresh from 'pulltorefreshjs';
import { AES, enc } from 'crypto-js';
import { Values } from '../values';
import { FriendsApiService } from '../Services/FriendsApiService';

@Component({
    templateUrl: '../Views/conversations.html',
    styleUrls: ['../Styles/conversations.css', '../Styles/reddot.css']
})
export class ConversationsComponent implements OnInit, OnDestroy {
    public info: ContactInfo[];
    public loadingImgURL = Values.loadingImgURL;
    constructor(
        public authApiService: AuthApiService,
        private friendsApiService: FriendsApiService,
        public router: Router,
        public cache: CacheService) {
        AppComponent.CurrentConversation = this;
        if (this.cache.GetConversations()) {
            this.info = this.cache.GetConversations();
        }
    }

    public ngOnInit(): void {
        PullToRefresh.destroyAll();
        PullToRefresh.init({
            distMax: 120,
            mainElement: '#main',
            // passive: true,
            refreshTimeout: 200,
            onRefresh: function (done) {
                AppComponent.CurrentConversation.init(AppComponent.CurrentConversation, function () {
                    done();
                });
            }
        });
        this.authApiService.SignInStatus().subscribe(signInStatus => {
            if (signInStatus.value) {
                this.init(this, null);
            }
        });
    }

    public init(component: ConversationsComponent, callback: () => void) {
        component.friendsApiService.MyFriends(false)
            .pipe(map(t => t.items))
            .subscribe(info => {
                info.forEach(e => {
                    if (e.latestMessage != null) {
                        e.latestMessage = AES.decrypt(e.latestMessage, e.aesKey).toString(enc.Utf8);
                        if (e.latestMessage.startsWith('[img]')) {
                            e.latestMessage = 'Photo';
                        }
                        if (e.latestMessage.startsWith('[video]')) {
                            e.latestMessage = 'Video';
                        }
                        if (e.latestMessage.startsWith('[file]')) {
                            e.latestMessage = 'File';
                        }
                    }
                    e.avatarURL = Values.fileAddress + e.displayImageKey;
                });
                component.info = info;
                component.cache.UpdateConversations(info);
                if (AppComponent.CurrentNav !== null) {
                    AppComponent.CurrentNav.ngOnInit();
                }
                if (callback != null) {
                    callback();
                }
            });
    }

    public detail(info: ContactInfo): void {
        if (info.userId == null) {
            this.router.navigate(['/group', info.conversationId]);
        } else {
            this.router.navigate(['/user', info.userId]);
        }
    }

    public talk(id: number): void {
        PullToRefresh.destroyAll();
        this.router.navigate(['/talking', id]);
    }

    public ngOnDestroy(): void {
        PullToRefresh.destroyAll();
        AppComponent.CurrentConversation = null;
    }
}
