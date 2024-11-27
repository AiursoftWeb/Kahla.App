import { lastValueFrom } from 'rxjs';
import { ThreadInfoJoined } from '../Models/Threads/ThreadInfo';
import { ThreadsApiService } from '../Services/Api/ThreadsApiService';
import { RepositoryBase } from './RepositoryBase';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class MyThreadsOrderedRepository extends RepositoryBase<ThreadInfoJoined> {
    protected readonly persistConfig = {
        name: 'mythreads-ordered',
        version: 1,
        persist: true,
    };
    private _canLoadMore = true;

    constructor(private threadsApiService: ThreadsApiService) {
        super();
    }

    protected async updateAllInternal(): Promise<void> {
        this.data = (await lastValueFrom(this.threadsApiService.Mine(20))).knownThreads;
        this._canLoadMore = this.data.length >= 20;
    }

    public get canLoadMore() {
        return this._canLoadMore;
    }

    protected async loadMoreInternal(take: number): Promise<void> {
        const lastId = this.data.at(-1).id;
        const newData = await lastValueFrom(this.threadsApiService.Mine(take, lastId));
        // the data might be changed since then
        // find the lastId, and append the new data after it. Discard any items after the lastId
        this.data = [
            ...this.data.slice(0, this.data.findLastIndex(t => t.id === lastId) + 1),
            ...newData.knownThreads,
        ];
    }
}
