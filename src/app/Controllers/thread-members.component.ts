import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { ThreadMembersRepository } from '../Repositories/ThreadMembersRepository';
import { ThreadsApiService } from '../Services/Api/ThreadsApiService';

@Component({
    selector: 'app-thread-members',
    templateUrl: '../Views/thread-members.html',
    styleUrls: ['../Styles/thread-members.scss'],
    standalone: false
})
export class ThreadMembersComponent {
    repo?: ThreadMembersRepository;

    constructor(route: ActivatedRoute, threadsApiService: ThreadsApiService) {
        route.params.pipe(map(p => p.id as number)).subscribe(id => {
            this.repo = new ThreadMembersRepository(threadsApiService, id);
            this.repo.updateAll();
        });
    }
}
