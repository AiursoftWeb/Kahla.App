import { lastValueFrom } from 'rxjs';
import { SearchApiService } from '../Services/Api/SearchApiService';
import { RepositoryBase, RepositoryPersistConfig } from './RepositoryBase';
import { ThreadInfo } from '../Models/ThreadInfo';

export class ServerThreadsRepository extends RepositoryBase<ThreadInfo> {
    protected readonly persistConfig: RepositoryPersistConfig = {
        persist: false,
    };

    constructor(
        private searchApiService: SearchApiService,
        private keyword?: string,
        private keywordExclude?: string
    ) {
        super();
    }

    protected async requestOnline(take: number, skip: number): Promise<[ThreadInfo[], number]> {
        const resp = await lastValueFrom(
            this.searchApiService.SearchThreads(this.keyword, take, skip, this.keywordExclude)
        );
        return [resp.threads, resp.totalThreadsCount];
    }
}
