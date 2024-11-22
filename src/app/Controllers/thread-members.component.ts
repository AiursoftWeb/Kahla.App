import { Component, computed, effect, input } from '@angular/core';
import { ThreadMembersRepository } from '../Repositories/ThreadMembersRepository';
import { ThreadsApiService } from '../Services/Api/ThreadsApiService';

@Component({
    selector: 'app-thread-members',
    templateUrl: '../Views/thread-members.html',
    styleUrls: ['../Styles/thread-members.scss'],
    standalone: false,
})
export class ThreadMembersComponent {
    id = input.required<number>();
    repo = computed(() => new ThreadMembersRepository(this.threadsApiService, this.id()));

    constructor(private threadsApiService: ThreadsApiService) {
        effect(() => {
            this.repo().updateAll();
        });
    }
}
