import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppComponent } from './app.component';
import { CacheService } from '../Services/CacheService';

@Component({
    selector: 'app-nav',
    templateUrl: '../Views/nav.html',
    styleUrls: ['../Styles/nav.css', '../Styles/reddot.css']
})
export class NavComponent implements OnInit, OnDestroy {
    public totalUnread = 0;
    public totalRequests = 0;
    constructor(
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
