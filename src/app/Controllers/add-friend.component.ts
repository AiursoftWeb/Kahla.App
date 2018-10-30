import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs/';
import { ApiService } from '../Services/ApiService';
import { KahlaUser } from '../Models/KahlaUser';
import { debounceTime, distinctUntilChanged, switchMap, filter, map } from 'rxjs/operators';
import { Values } from '../values';

@Component({
    templateUrl: '../Views/add-friend.html',
    styleUrls: ['../Styles/add-friend.css',
                '../Styles/button.css']

})
export class AddFriendComponent implements OnInit {
    public users: Observable<KahlaUser[]> = new Observable<KahlaUser[]>();
    public loadingImgURL = Values.loadingImgURL;
    private searchTerms = new Subject<string>();
    public searching = false;
    private forceSearch = false;
    public noResult = false;

    constructor(
        private apiService: ApiService,
        private router: Router) {
    }

    public ngOnInit(): void {
        this.users = this.searchTerms.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            filter(term => {
                if (this.forceSearch) {
                    this.searching = true;
                    this.forceSearch = false;
                    return term.trim().length > 0;
                } else {
                    return term.trim().length >= 3;
                }
            }),
            switchMap(term => this.apiService.SearchFriends(term.trim())),
            map(t => {
                this.noResult = t.items.length === 0 ? true : false;
                t.items.forEach(item => {
                    item.avatarURL = Values.fileAddress + item.headImgFileKey;
                });
                this.searching = false;
                return t.items;
            })
        );
    }

    public search(term: string, force: boolean): void {
        if (force) {
            this.forceSearch = true;
            this.searchTerms.next(term + ' ');
        } else {
            this.searchTerms.next(term);
        }
    }

    public detail(id: number): void {
        this.router.navigate(['/kahla/user', id]);
    }
}
