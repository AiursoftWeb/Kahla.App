import { Component, OnInit } from '@angular/core';
import { ThreadInfo } from '../Models/ThreadInfo';
import { Router } from '@angular/router';
import { CacheService } from '../Services/CacheService';
import { Values } from '../values';
import { MyThreadsRepository } from '../Repositories/ThreadsRepository';

@Component({
    selector: 'app-conversations',
    templateUrl: '../Views/conversations.html',
    styleUrls: [],
})
export class ConversationsComponent implements OnInit {
    public loadingImgURL = Values.loadingImgURL;

    constructor(
        private router: Router,
        public cacheService: CacheService,
        public myThreadsRepository: MyThreadsRepository
    ) {}

    public ngOnInit(): void {
        if (!this.myThreadsRepository.health) this.myThreadsRepository.updateAll();
    }

    public detail(info: ThreadInfo): void {
        this.router.navigate(['/detail', info.id]);
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
