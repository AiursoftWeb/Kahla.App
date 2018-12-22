import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs/';
import { FriendsApiService } from '../Services/FriendsApiService';
import { KahlaUser } from '../Models/KahlaUser';
import { debounceTime, distinctUntilChanged, switchMap, filter, map } from 'rxjs/operators';
import { Values } from '../values';
import { HeaderService } from '../Services/HeaderService';

@Component({
    templateUrl: '../Views/add-friend.html',
    styleUrls: ['../Styles/add-friend.css',
                '../Styles/button.css']

})
export class AddFriendComponent implements OnInit {
    public users: Observable<KahlaUser[]> = new Observable<KahlaUser[]>();
    public loadingImgURL = Values.loadingImgURL;
    private searchTerms = new BehaviorSubject<string>('');
    public searching = false;
    public searchMode = 0;
    public resultLength = -1;
    public noMoreUsers = false;
    private searchNumbers = 0;

    constructor(
        private friendsApiService: FriendsApiService,
        private router: Router,
        private headerService: HeaderService) {
            this.headerService.title = 'Add Friend';
            this.headerService.returnButton = true;
            this.headerService.button = false;
            this.headerService.shadow = false;
        }

    public ngOnInit(): void {
        this.users = this.searchTerms.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            filter(term => {
                switch (this.searchMode) {
                    case 0:    // auto search
                        if (term.trim().length >= 3) {
                            this.searching = true;
                            this.searchNumbers = 20;
                            return true;
                        } else {
                            return false;
                        }
                    case 1:    // force search
                    case 2:    // load more
                        if (term.trim().length > 0) {
                            this.searching = true;
                            if (this.searchMode === 1) {
                                this.searchNumbers = 20;
                            } else {
                                this.searchNumbers += 20;
                            }
                            return true;
                        } else {
                            return false;
                        }
                    default:
                        return false;
                }
            }),
            switchMap(term => this.friendsApiService.SearchFriends(term.trim(), this.searchNumbers)),
            map(t => {
                this.resultLength = t.items.length;
                this.noMoreUsers = t.items.length < this.searchNumbers ? true : false;
                t.items.forEach(item => {
                    item.avatarURL = Values.fileAddress + item.headImgFileKey;
                });
                this.searching = false;
                return t.items;
            })
        );
    }

    public search(term: string, mode: number): void {
        this.searchMode = mode;
        if (mode === 0) {    // auto search
            this.searchTerms.next(term.trim());
        } else {    // force search or load more
            this.searchTerms.next(this.searchTerms.value + ' ');
        }
    }

    public detail(id: number): void {
        this.router.navigate(['/user', id]);
    }
}
