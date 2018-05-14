import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs/';


import { ApiService } from '../Services/ApiService';

import { KahlaUser } from '../Models/KahlaUser';

import { debounceTime, distinctUntilChanged, switchMap, filter, map } from 'rxjs/operators';

@Component({
    templateUrl: '../Views/add-friend.html',
    styleUrls: ['../Styles/add-friend.css']

})
export class AddFriendComponent implements OnInit {
    public users: Observable<KahlaUser[]> = new Observable<KahlaUser[]>();
    private searchTerms = new Subject<string>();

    constructor(
        private apiService: ApiService,
        private router: Router) {
    }

    public ngOnInit(): void {
        this.users = this.searchTerms.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            filter(term => term.length >= 3),
            switchMap(term => this.apiService.SearchFriends(term)),
            map(t => t.items)
        );
    }

    public search(term: string): void {
        this.searchTerms.next(term);
    }

    public detail(id: number): void {
        this.router.navigate(['/kahla/user', id]);
    }
}
