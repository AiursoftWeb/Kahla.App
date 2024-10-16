import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RepositoryBase } from '../Repositories/RepositoryBase';
import { ThreadInfo } from '../Models/ThreadInfo';
import { CacheService } from '../Services/CacheService';
import { Values } from '../values';

@Component({
    selector: 'app-threads-list',
    templateUrl: '../Views/threads-list.html',
    styleUrls: ['../Styles/threads-list.scss', '../Styles/reddot.scss', '../Styles/button.scss'],
})
export class ThreadsListComponent {
    @Input() public threadRepo: RepositoryBase<ThreadInfo>;

    @Input() public emptyMessage = 'No results.';

    @Input() public highlightPredicate: (item: ThreadInfo) => boolean = () => false;

    @Input() public externalView = false;

    @Output() public threadClicked = new EventEmitter<{
        thread: ThreadInfo;
        secondary: boolean;
    }>();

    public loadingImgURL = Values.loadingImgURL;

    constructor(public cacheService: CacheService) {}

    public nameOf(thread: ThreadInfo): string {
        if (!thread.name.includes('{THE OTHER USER}')) return thread.name;
        return thread.name.replace(
            '{THE OTHER USER}',
            thread.topTenMembers
                .filter(
                    t =>
                        !this.cacheService.cachedData.me ||
                        t.user.id !== this.cacheService.cachedData.me.id
                )
                .map(t => t.user.nickName)
                .join(', ')
        );
    }

    public onlineStatusOf(thread: ThreadInfo): boolean | null {
        if ((!this.cacheService?.cachedData?.me) || thread.topTenMembers.length <= 1) return null;
        return thread.topTenMembers
            .filter(t => t.user.id !== this.cacheService.cachedData.me.id)
            .some(t => t.online);
    }
}
