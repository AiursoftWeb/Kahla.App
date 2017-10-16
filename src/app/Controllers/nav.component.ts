import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../Services/ApiService';
import { Location } from '@angular/common';
import { AppComponent } from './app.component';
import { ContactInfo } from '../Models/ContactInfo';
import { AiurCollection } from '../Models/AiurCollection';
import { CacheModel } from '../Models/CacheModel';
import { CacheService } from '../Services/CacheService';

@Component({
    selector: 'app-nav',
    templateUrl: '../Views/nav.html',
    styleUrls: ['../Styles/nav.css']
})
export class NavComponent implements OnInit, OnDestroy {
    public totalUnread = 0;
    public totalRequests = 0;
    constructor(
        private apiService: ApiService,
        private location: Location,
        private cache: CacheService) {
        AppComponent.CurrentNav = this;
    }

    public ngOnInit(): void {
        const conversations = this.cache.GetConversations();
        const requests = this.cache.GetFriendRequests();
        if (conversations) {
            this.totalUnread = conversations.map(item => item.unReadAmount).reduce((a, b) => a + b, 0);
        }
        if (requests) {
            this.totalRequests = requests.filter(t => !t.completed).length;
        }
    }

    public ngOnDestroy(): void {
        AppComponent.CurrentNav = null;
    }
}
