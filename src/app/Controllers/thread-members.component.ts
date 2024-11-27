import { Component, input, resource, signal } from '@angular/core';
import { ThreadMembersRepository } from '../Repositories/ThreadMembersRepository';
import { ThreadsApiService } from '../Services/Api/ThreadsApiService';
import { ThreadInfoCacheDictionary } from '../Caching/ThreadInfoCacheDictionary';
import { showCommonErrorDialog } from '../Utils/CommonErrorDialog';
import { ThreadMemberInfo } from '../Models/Threads/ThreadMemberInfo';
import { ContactInfo } from '../Models/Contacts/ContactInfo';

@Component({
    selector: 'app-thread-members',
    templateUrl: '../Views/thread-members.html',
    styleUrls: ['../Styles/thread-members.scss'],
    standalone: false,
})
export class ThreadMembersComponent {
    id = input.required<number>();
    repo = resource({
        request: () => this.id(),
        loader: async ({ request: id }) => {
            const repo = new ThreadMembersRepository(this.threadsApiService, id);
            await repo.updateAll().catch(showCommonErrorDialog);
            return repo;
        },
    });

    threadInfo = resource({
        request: () => this.id(),
        loader: async ({ request: id }) => {
            return await this.threadInfoCacheDictionary.get(id).catch(showCommonErrorDialog);
        },
    });

    viewingDetail = signal<ThreadMemberInfo>(null);

    viewDetail(inf: ContactInfo) {
        this.viewingDetail.set(inf as ThreadMemberInfo);
    }

    constructor(
        private threadsApiService: ThreadsApiService,
        private threadInfoCacheDictionary: ThreadInfoCacheDictionary
    ) {}
}
