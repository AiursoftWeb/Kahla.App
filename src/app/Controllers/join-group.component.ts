import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ApiService } from '../Services/ApiService';
import { debounceTime, distinctUntilChanged, switchMap, filter, map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs/';
import { GroupConversation } from '../Models/GroupConversation';
import { Values } from '../values';

@Component({
    templateUrl: '../Views/join-group.html',
    styleUrls: [
        '../Styles/add-friend.css',
        '../Styles/menu.css',
        '../Styles/button.css'
    ]
})
export class JoinGroupComponent implements OnInit {
    public groups: Observable<GroupConversation[]> = new Observable<GroupConversation[]>();
    public loadingImgURL = Values.loadingImgURL;
    private searchTerms = new BehaviorSubject<string>('');
    public noResult = false;
    public searching = false;
    private searchNumbers = 1;
    public noMoreGroups = false;

    constructor(
        private apiService: ApiService,
        private router: Router) {
    }

    public ngOnInit(): void {
        this.groups = this.searchTerms.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            filter(term => {
                return term.trim().length >= 3 && !this.noMoreGroups;
            }),
            switchMap(term => this.apiService.SearchGroup(term.trim(), this.searchNumbers)),
            map(t => {
                this.noResult = t.items.length === 0 ? true : false;
                this.noMoreGroups = t.items.length < this.searchNumbers ? true : false;
                t.items.forEach(item => {
                    item.avatarURL = Values.fileAddress + item.groupImageKey;
                });
                this.searching = false;
                return t.items;
            })
        );
    }

    public search(term: string, loadMore: boolean): void {
        this.searching = true;
        if (!loadMore) {
            this.searchTerms.next(term.trim());
            this.searchNumbers = 1;
            this.noMoreGroups = false;
        } else {
            this.searchTerms.next(this.searchTerms.value + ' ');
            this.searchNumbers += 1;
        }
    }

    public joinGroup(groupName: string) {
        this.apiService.JoinGroup(groupName).subscribe((response) => {
            if (response.code === 0) {
                this.router.navigate(['/']);
            } else {
                Swal('Try again', response.message, 'error');
            }
        });
    }
}
