import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ApiService } from '../Services/ApiService';
import { debounceTime, distinctUntilChanged, switchMap, filter, map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs/';
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
    private searchTerms = new Subject<string>();

    constructor(
        private apiService: ApiService,
        private router: Router) {
    }

    public ngOnInit(): void {
        this.groups = this.searchTerms.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            filter(term => term.length >= 3),
            switchMap(term => this.apiService.SearchGroup(term)),
            map(t => {
                t.items.forEach(item => {
                    item.avatarURL = Values.fileAddress + item.groupImageKey;
                });
                return t.items;
            })
        );
    }

    public search(term: string): void {
        this.searchTerms.next(term);
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
