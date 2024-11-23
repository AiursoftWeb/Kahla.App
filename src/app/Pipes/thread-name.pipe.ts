import { Pipe, PipeTransform } from '@angular/core';
import { ThreadInfo, ThreadInfoJoined } from '../Models/ThreadInfo';
import { CacheService } from '../Services/CacheService';
@Pipe({
    name: 'threadName',
    standalone: true,
})
export class ThreadNamePipe implements PipeTransform {
    constructor(private cacheService: CacheService) {}
    transform(thread?: ThreadInfo | ThreadInfoJoined): string {
        if (!thread) return 'Thread';
        if (!thread.name.includes('{THE OTHER USER}')) return thread.name;
        if (!(thread as ThreadInfoJoined).topTenMembers) return thread.name;
        const name = thread.name.replace(
            '{THE OTHER USER}',
            (thread as ThreadInfoJoined).topTenMembers
                .filter(
                    t =>
                        !this.cacheService?.cachedData?.me ||
                        t.user.id !== this.cacheService.cachedData.me.id
                )
                .map(t => t.user.nickName)
                .join(', ')
        );
        if (!name.trim()) {
            return this.cacheService?.cachedData?.me?.nickName ?? 'You';
        }
        return name;
    }
}
