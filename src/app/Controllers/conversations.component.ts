import { Component, effect, OnInit, signal } from '@angular/core';
import { ThreadInfo } from '../Models/Threads/ThreadInfo';
import { Router } from '@angular/router';
import { CacheService } from '../Services/CacheService';
import { Values } from '../values';
import { MyThreadsRepositoryFiltered } from '../Repositories/ThreadsRepository';
import { ThreadsApiService } from '../Services/Api/ThreadsApiService';
import { MyThreadsOrderedRepository } from '../Repositories/MyThreadsOrderedRepository';
import { RepositoryBase } from '../Repositories/RepositoryBase';

@Component({
    selector: 'app-conversations',
    templateUrl: '../Views/conversations.html',
    styleUrls: [],
    standalone: false,
})
export class ConversationsComponent implements OnInit {
    public loadingImgURL = Values.loadingImgURL;
    public threadsRepo?: RepositoryBase<ThreadInfo>;
    searchText = signal('');

    constructor(
        private router: Router,
        public cacheService: CacheService,
        public myThreadsOrderedRepository: MyThreadsOrderedRepository,
        private threadsApiService: ThreadsApiService
    ) {
        effect(() => {
            if (this.searchText()) {
                this.threadsRepo = new MyThreadsRepositoryFiltered(
                    this.threadsApiService,
                    this.searchText()
                );
                this.threadsRepo.updateAll();
            } else {
                this.threadsRepo = this.myThreadsOrderedRepository;
            }
        });
    }

    public ngOnInit(): void {
        this.myThreadsOrderedRepository.updateAll();
    }

    public detail(info: ThreadInfo): void {
        this.router.navigate(['/detail', info.id]);
    }

    public current(info: ThreadInfo): boolean {
        return new RegExp(`^.+/${info.id}(/.*)*$`, 'g').test(this.router.url);
    }

    public goTalking(id: number) {
        this.router.navigate(['/talking', id]);
    }
}
