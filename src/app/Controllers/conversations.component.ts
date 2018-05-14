import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../Services/ApiService';
import { ContactInfo } from '../Models/ContactInfo';
import { Router } from '@angular/router';
import { AppComponent } from './app.component';
import { CacheService } from '../Services/CacheService';
import { map } from 'rxjs/operators';
import * as PullToRefresh from 'pulltorefreshjs';

@Component({
    templateUrl: '../Views/conversations.html',
    styleUrls: ['../Styles/conversations.css']
})
export class ConversationsComponent implements OnInit, OnDestroy {
    public info: ContactInfo[];
    constructor(
        public apiService: ApiService,
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
            passive: true,
            refreshTimeout: 200,
            onRefresh: function (done) {
                AppComponent.CurrentConversation.init(AppComponent.CurrentConversation, function () {
                    done();
                });
            }
        });
        this.init(this, null);
    }

    public init(component: ConversationsComponent, callback: () => void) {
        component.apiService.MyFriends(false)
            .pipe(map(t => t.items))
            .subscribe(info => {
                component.info = info;
                component.cache.UpdateConversations(info);
                AppComponent.CurrentNav.ngOnInit();
                if (callback != null) {
                    callback();
                }
            });
    }

    public detail(info: ContactInfo): void {
        if (info.userId == null) {
            this.router.navigate(['/kahla/group', info.conversationId]);
        } else {
            this.router.navigate(['/kahla/user', info.userId]);
        }
    }

    public talk(id: number): void {
        PullToRefresh.destroyAll();
        this.router.navigate(['/kahla/talking', id]);
    }

    public ngOnDestroy(): void {
        PullToRefresh.destroyAll();
        AppComponent.CurrentConversation = null;
    }
}
