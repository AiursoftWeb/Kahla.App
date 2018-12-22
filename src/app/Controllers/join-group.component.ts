import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { GroupsApiService } from '../Services/GroupsApiService';
import { debounceTime, distinctUntilChanged, switchMap, filter, map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs/';
import { GroupConversation } from '../Models/GroupConversation';
import { Values } from '../values';
import { HeaderService } from '../Services/HeaderService';

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
    public searching = false;
    private searchMode = false;
    public resultLength = -1;
    public noMoreGroups = false;
    private searchNumbers = 0;

    constructor(
        private groupsApiService: GroupsApiService,
        private router: Router,
        private headerService: HeaderService) {
            this.headerService.title = 'Join Group';
            this.headerService.returnButton = true;
            this.headerService.button = false;
            this.headerService.shadow = false;
    }

    public ngOnInit(): void {
        this.groups = this.searchTerms.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            filter(term => {
                if (term.trim().length >= 3) {
                    if (this.searchMode) {
                        this.searchNumbers += 20;
                    } else {
                        this.searchNumbers = 20;
                    }
                    this.searching = true;
                    return true;
                } else {
                    return false;
                }
            }),
            switchMap(term => this.groupsApiService.SearchGroup(term.trim(), this.searchNumbers)),
            map(t => {
                this.resultLength = t.items.length;
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
        this.searchMode = loadMore;
        if (!loadMore) {
            this.searchTerms.next(term.trim());
        } else {
            this.searchTerms.next(this.searchTerms.value + ' ');
        }
    }

    public joinGroup(groupName: string) {
        this.groupsApiService.JoinGroup(groupName).subscribe((response) => {
            if (response.code === 0) {
                this.router.navigate(['/']);
            } else {
                Swal('Try again', response.message, 'error');
            }
        });
    }
}
