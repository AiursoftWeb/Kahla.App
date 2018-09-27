import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../Services/ApiService';
import { Router } from '@angular/router';
import { ContactInfo } from '../Models/ContactInfo';
import { AppComponent } from './app.component';
import { Request } from '../Models/Request';
import { CacheService } from '../Services/CacheService';
import * as PullToRefresh from 'pulltorefreshjs';
import { Values } from '../values';

@Component({
    templateUrl: '../Views/friends.html',
    styleUrls: ['../Styles/friends.css']

})
export class FriendsComponent implements OnInit, OnDestroy {
    public infos: ContactInfo[];
    public requests: Request[];
    private option = { month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: 'numeric' };

    constructor(
        private apiService: ApiService,
        private router: Router,
        private cache: CacheService) {
        AppComponent.CurrentFriend = this;
        if (this.cache.GetFriendList()) {
            this.infos = this.cache.GetFriendList();
            this.requests = this.cache.GetFriendRequests().filter(t => !t.completed);
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
                AppComponent.CurrentFriend.init(function () {
                    done();
                });
            }
        });
        this.init(null);
    }

    public init(callback: () => void) {
        this.apiService.MyFriends(true)
            .subscribe(response => {
                response.items.forEach(item => {
                    if (item.displayImageKey === 766 || item.displayImageKey === 10) {
                        item.avatarURL = '../../assets/group.jpg';
                    } else if (item.displayImageKey === 739) {
                        item.avatarURL = '../../assets/default.jpg';
                    } else {
                        item.avatarURL = Values.fileAddress + item.displayImageKey;
                    }
                });
                this.infos = response.items;
                this.cache.UpdateFriendList(response.items);
                AppComponent.CurrentNav.ngOnInit();
                if (callback != null) {
                    callback();
                }
            });
        this.apiService.MyRequests()
            .subscribe(response => {
                this.requests = response.items.filter(t => !t.completed);
                response.items.forEach(item => {
                    item.createTime = new Date(item.createTime).toLocaleString([], this.option);
                    if (item.creator.headImgFileKey === 739) {
                        item.creator.avatarURL = '../../assets/default.jpg';
                    } else {
                        item.creator.avatarURL = Values.fileAddress + item.creator.avatarURL;
                    }
                });
                this.cache.UpdateFriendRequests(response.items);
                AppComponent.CurrentNav.ngOnInit();
            });
    }


    public detail(info: ContactInfo): void {
        if (info.userId == null) {
            this.router.navigate(['/kahla/group', info.conversationId]);
        } else {
            this.router.navigate(['/kahla/user', info.userId]);
        }
    }

    public ngOnDestroy(): void {
        PullToRefresh.destroyAll();
        AppComponent.CurrentFriend = null;
    }
}
