import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

// Observable class extensions
import 'rxjs/add/observable/of';

// Observable operators
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/switchMap';

import { ApiService } from '../Services/ApiService';

import { KahlaUser } from '../Models/KahlaUser';
import { AppComponent } from './app.component';


@Component({
    templateUrl: '../Views/add-friend.html',
    styleUrls: ['../Styles/add-friend.css']

})
export class AddFriendComponent implements OnInit {
    public users: Observable<KahlaUser[]> = new Observable<KahlaUser[]>();
    private searchTerms = new Subject<string>();

    constructor(
        private apiService: ApiService,
        private location: Location,
        private router: Router) {
    }

    public ngOnInit(): void {
        this.users = this.searchTerms
            .debounceTime(300)
            .distinctUntilChanged()
            .filter(term => term.length >= 3)
            .switchMap(term => this.apiService.SearchFriends(term).map(t => t.items));
    }

    public search(term: string): void {
        this.searchTerms.next(term);
    }

    public detail(id: number): void {
        this.router.navigate(['/kahla/user', id]);
    }
}
