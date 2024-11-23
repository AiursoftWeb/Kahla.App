import { lastValueFrom } from 'rxjs';
import { ThreadInfoJoined } from '../Models/ThreadInfo';
import { RepositoryBase, RepositoryPersistConfig } from './RepositoryBase';
import { ContactsApiService } from '../Services/Api/ContactsApiService';

export class CommonThreadRepository extends RepositoryBase<ThreadInfoJoined> {
    protected readonly persistConfig: RepositoryPersistConfig = {
        persist: false,
    };

    constructor(
        private contactsApiService: ContactsApiService,
        private userId: string
    ) {
        super();
    }

    protected async requestOnline(take: number, skip: number): Promise<[ThreadInfoJoined[], number]> {
        const resp = await lastValueFrom(this.contactsApiService.Details(this.userId, take, skip));
        return [resp.commonThreads, resp.commonThreadsCount];
    }
}
