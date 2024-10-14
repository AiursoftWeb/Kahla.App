import { Component, OnInit } from '@angular/core';
import { ThreadInfo } from '../Models/ThreadInfo';
import { Router } from '@angular/router';
import { CacheService } from '../Services/CacheService';
import { Values } from '../values';
import { HomeService } from '../Services/HomeService';

@Component({
    selector: 'app-conversations',
    templateUrl: '../Views/conversations.html',
    styleUrls: [
        '../Styles/conversations.scss',
        '../Styles/reddot.scss',
        '../Styles/button.scss',
        '../Styles/badge.scss',
    ],
})
export class ConversationsComponent implements OnInit {
    public loadingImgURL = Values.loadingImgURL;

    constructor(
        private router: Router,
        public cacheService: CacheService,
        private homeService: HomeService
    ) {}

    public ngOnInit(): void {
        if (this.cacheService.cachedData.me) {
            this.cacheService.updateConversation();
        }
        setTimeout(() => {
            if (this.homeService.floatingHomeWrapper === null) {
                document.body.scroll(0, 0);
            } else {
                this.homeService.floatingHomeWrapper.scroll(0, 0);
            }
        }, 0);
    }

    public detail(info: ThreadInfo): void {
        if (info.discriminator === 'GroupConversation') {
            this.router.navigate(['/group', info.id]);
        } else {
            this.router.navigate(['/user', info.userId]);
        }
    }

    public current(info: ThreadInfo): boolean {
        return new RegExp(`^.+/${info.id}(/.*)*$`, 'g').test(this.router.url);
    }

    public talk(id: number, unread: number): void {
        const conversation = this.cacheService.cachedData.conversations.find(x => x.id === id);
        conversation.unReadAmount = 0;
        conversation.someoneAtMe = false;
        this.cacheService.updateTotalUnread();
        if (this.router.isActive(`/talking/${id}`, false)) {
            return;
        }
        if (unread > 0 && unread <= 50) {
            this.router.navigate(['/talking', id, unread]);
        } else {
            this.router.navigate(['/talking', id]);
        }
    }
}
