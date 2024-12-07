import { filter, lastValueFrom } from 'rxjs';
import { ThreadInfoJoined } from '../Models/Threads/ThreadInfo';
import { ThreadsApiService } from '../Services/Api/ThreadsApiService';
import { RepositoryBase } from './RepositoryBase';
import { Injectable } from '@angular/core';
import { EventService } from '../Services/EventService';
import { isThreadAddedEvent } from '../Models/Events/ThreadAddedEvent';
import { isThreadRemovedEvent } from '../Models/Events/ThreadRemovedEvent';
import { KahlaEventType } from '../Models/Events/EventType';
import { NewMessageEvent } from '../Models/Events/NewMessageEvent';
import { ThreadInfoCacheDictionary } from '../Caching/ThreadInfoCacheDictionary';

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

    constructor(
        private threadsApiService: ThreadsApiService,
        private eventService: EventService,
        private threadInfoCacheDictionary: ThreadInfoCacheDictionary
    ) {
        super();
        eventService.onMessage.pipe(filter(t => isThreadAddedEvent(t))).subscribe(t => {
            this.data = [t.thread, ...this.data];
        });

        eventService.onMessage.pipe(filter(t => isThreadRemovedEvent(t))).subscribe(t => {
            this.data = this.data.filter(d => d.id !== t.threadId);
        });

        eventService.onMessage
            .pipe(filter(t => t.type === KahlaEventType.NewMessage))
            .subscribe(async t => {
                const ev = t as NewMessageEvent;
                const threadId = ev.message.threadId;
                let thread: ThreadInfoJoined;
                if (this.data.some(t => t.id === threadId)) {
                    // Move the thread to the top
                    thread = this.data.find(t => t.id === threadId)!;
                    this.data = this.data.filter(t => t.id !== threadId);
                } else {
                    thread = await this.threadInfoCacheDictionary.get(threadId);
                }
                thread.messageContext.latestMessage = ev.message;
                this.data = [thread, ...this.data];
                this.threadInfoCacheDictionary.set(threadId, thread);
            });
    }

    private updateCache(threads: ThreadInfoJoined[]) {
        threads.forEach(t => this.threadInfoCacheDictionary.set(t.id, t));
    }

    protected async updateAllInternal(): Promise<void> {
        this.data = (await lastValueFrom(this.threadsApiService.Mine(20))).knownThreads;
        this.updateCache(this.data);
        this._canLoadMore = this.data.length >= 20;
    }

    public get canLoadMore() {
        return this._canLoadMore;
    }

    protected async loadMoreInternal(take: number): Promise<void> {
        const lastId = this.data.at(-1)?.id;
        const newData = await lastValueFrom(this.threadsApiService.Mine(take, lastId));
        this.updateCache(newData.knownThreads);
        // the data might be changed since then
        // find the lastId, and append the new data after it. Discard any items after the lastId
        this.data = [
            ...this.data.slice(0, this.data.findLastIndex(t => t.id === lastId) + 1),
            ...newData.knownThreads,
        ];
    }
}
