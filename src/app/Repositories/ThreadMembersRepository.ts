import { lastValueFrom } from 'rxjs';
import { ThreadMemberInfo } from '../Models/Threads/ThreadMemberInfo';
import { ThreadsApiService } from '../Services/Api/ThreadsApiService';
import { RepositoryListBase, RepositoryPersistConfig } from './RepositoryBase';

export class ThreadMembersRepository extends RepositoryListBase<ThreadMemberInfo> {
    protected readonly persistConfig: RepositoryPersistConfig = {
        persist: false,
    };

    constructor(
        private threadsApiService: ThreadsApiService,
        private threadId: number
    ) {
        super();
    }

    protected async requestOnline(
        take: number,
        skip: number
    ): Promise<[ThreadMemberInfo[], number]> {
        const resp = await lastValueFrom(this.threadsApiService.Members(this.threadId, take, skip));
        return [resp.members, resp.totalCount];
    }
}
