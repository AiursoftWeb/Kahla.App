import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RepositoryBase } from '../Repositories/RepositoryBase';
import { ThreadInfo, ThreadInfoJoined } from '../Models/Threads/ThreadInfo';
import { CacheService } from '../Services/CacheService';
import { Values } from '../values';

@Component({
    selector: 'app-threads-list',
    templateUrl: '../Views/threads-list.html',
    styleUrls: ['../Styles/threads-list.scss', '../Styles/reddot.scss'],
    standalone: false,
})
export class ThreadsListComponent {
    @Input() public threadRepo: RepositoryBase<ThreadInfo>;

    @Input() public emptyMessage = 'No results.';

    @Input() public highlightPredicate: (item: ThreadInfo) => boolean = () => false;

    @Input() public externalView = false;

    @Input() public scrollingContainer?: HTMLElement;

    @Input() public autoLoadMore = false;

    @Output() public threadClicked = new EventEmitter<{
        thread: ThreadInfo;
        secondary: boolean;
    }>();

    public loadingImgURL = Values.loadingImgURL;

    constructor(public cacheService: CacheService) {}

    public onlineStatusOf(thread: ThreadInfoJoined): boolean | null {
        if (!this.cacheService?.cachedData?.me || thread.topTenMembers.length <= 1) return null;
        return thread.topTenMembers
            .filter(t => t.user.id !== this.cacheService.cachedData.me.id)
            .some(t => t.online);
    }

    public asJoined(thread: ThreadInfo): ThreadInfoJoined {
        return thread as ThreadInfoJoined;
    }
}
