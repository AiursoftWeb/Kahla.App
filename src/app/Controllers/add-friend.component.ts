import { Component } from '@angular/core';
import { FriendsApiService } from '../Services/FriendsApiService';
import { Values } from '../values';
import { HeaderService } from '../Services/HeaderService';
import { SearchResult } from '../Models/SearchResult';
import Swal from 'sweetalert2';
import { GroupsApiService } from '../Services/GroupsApiService';
import { Router } from '@angular/router';
import { CacheService } from '../Services/CacheService';
import { GroupsResult } from '../Models/GroupsResults';

@Component({
    templateUrl: '../Views/add-friend.html',
    styleUrls: ['../Styles/add-friend.scss',
                '../Styles/button.scss',
                '../Styles/reddot.scss']

})
export class AddFriendComponent {
    public results: SearchResult;
    public loadingImgURL = Values.loadingImgURL;
    public searching = false;
    public searchMode = 0;
    public showUsers = true;
    public searchNumbers = 0;

    constructor(
        private friendsApiService: FriendsApiService,
        private groupsApiService: GroupsApiService,
        private router: Router,
        private cacheService: CacheService,
        private headerService: HeaderService) {
            this.headerService.title = 'Global Search';
            this.headerService.returnButton = true;
            this.headerService.button = false;
            this.headerService.shadow = false;
            this.headerService.timer = false;
        }

    public search(term: string, mode: number): void {
        this.searchMode = mode;
        if (term && term.trim().length > 0) {
            if (mode === 0) {
                this.searchNumbers = 20;
            } else {
                // load more
                this.searchNumbers += 20;
            }
            this.callSearchApi(term);
        }
    }

    private callSearchApi(term: string): void {
        this.friendsApiService.SearchEverything(term.trim(), this.searchNumbers).subscribe(result => {
            if (result.code === 0) {
                result.users.forEach(user => {
                    user.avatarURL = Values.fileAddress + user.headImgFileKey;
                });
                result.groups.forEach(group => {
                    group.avatarURL = Values.fileAddress + group.imageKey;
                });
                this.results = result;
                if (this.showUsers && result.usersCount === 0 && result.groupsCount !== 0) {
                    this.showUsers = false;
                } else if (!this.showUsers && result.groupsCount === 0 && result.usersCount !== 0) {
                    this.showUsers = true;
                }
            }
        });
    }

    public showUsersResults(selectUsers: boolean): void {
        this.showUsers = selectUsers;
    }

    public joinGroup(group: GroupsResult) {
        if (group.joined) {
            this.router.navigate(['/group/' + group.id]);
        } else if (group.hasPassword) {
            Swal.fire({
                title: 'Enter group password.',
                input: 'text',
                inputAttributes: {
                    maxlength: '100'
                },
                showCancelButton: true,
                confirmButtonText: 'Join'
            }).then((result) => {
                if (result.value) {
                    this.joinGroupWithPassword(group.name, result.value, group.id);
                }
            });
        } else {
            this.joinGroupWithPassword(group.name, '', group.id);
        }
    }

    private joinGroupWithPassword(groupName: string, password: string, id: number) {
        this.groupsApiService.JoinGroup(groupName, password).subscribe((response) => {
            if (response.code === 0) {
                this.cacheService.UpdateConversation();
                this.router.navigate(['/talking/' + id]);
            } else {
                Swal.fire('Error', response.message, 'error');
            }
        });
    }

    SearchBoxKeyUp(event: KeyboardEvent, element: HTMLInputElement) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.search(element.value, 0);
        }
    }
}
