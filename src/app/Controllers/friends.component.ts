import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../Services/ApiService';
import { Router } from '@angular/router';
import { ContactInfo } from '../Models/ContactInfo';
import { AppComponent } from './app.component';
import { Request } from '../Models/Request';
import { CacheService } from '../Services/CacheService';

@Component({
    templateUrl: '../Views/friends.html',
    styleUrls: ['../Styles/friends.css']

})
export class FriendsComponent implements OnInit, OnDestroy {
    public infos: ContactInfo[];
    public requests: Request[];

    constructor(
        private apiService: ApiService,
        private router: Router,
        private cache: CacheService) {
        if (this.cache.GetFriendList()) {
            this.infos = this.cache.GetFriendList();
            this.requests = this.cache.GetFriendRequests().filter(t => !t.completed);
        }
    }

    public ngOnInit(): void {
        AppComponent.CurrentFriend = this;
        this.apiService.MyFriends(true)
            .subscribe(response => {
                this.infos = response.items;
                this.cache.UpdateFriendList(response.items);
                AppComponent.CurrentNav.ngOnInit();
            });
        this.apiService.MyRequests()
            .subscribe(response => {
                this.requests = response.items.filter(t => !t.completed);
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
        AppComponent.CurrentFriend = null;
    }
}
