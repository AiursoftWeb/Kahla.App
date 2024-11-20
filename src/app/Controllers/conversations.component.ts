import { Component, effect, OnInit, signal } from '@angular/core';
import { ThreadInfo } from '../Models/ThreadInfo';
import { Router } from '@angular/router';
import { CacheService } from '../Services/CacheService';
import { Values } from '../values';
import {
    MyThreadsRepository,
    MyThreadsRepositoryFiltered,
} from '../Repositories/ThreadsRepository';
import { ThreadsApiService } from '../Services/Api/ThreadsApiService';

@Component({
    selector: 'app-conversations',
    templateUrl: '../Views/conversations.html',
    styleUrls: [],
    standalone: false,
})
export class ConversationsComponent implements OnInit {
    public loadingImgURL = Values.loadingImgURL;
    public threadsRepo?: MyThreadsRepositoryFiltered;
    searchText = signal('');

    constructor(
        private router: Router,
        public cacheService: CacheService,
        public myThreadsRepository: MyThreadsRepository,
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
                this.threadsRepo = this.myThreadsRepository;
            }
        });
    }

    public ngOnInit(): void {
        this.myThreadsRepository.updateAll();
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
