import { Component } from '@angular/core';
import { FriendsApiService } from '../Services/FriendsApiService';
import { Values } from '../values';
import { HeaderService } from '../Services/HeaderService';
import { SearchResult } from '../Models/SearchResult';
import Swal from 'sweetalert2';
import { GroupsApiService } from '../Services/GroupsApiService';
import { Router } from '@angular/router';
import { CacheService } from '../Services/CacheService';

@Component({
    templateUrl: '../Views/add-friend.html',
    styleUrls: ['../Styles/add-friend.css',
                '../Styles/button.css',
                '../Styles/reddot.css']

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
        }

    public search(term: string, mode: number): void {
        this.searchMode = mode;
        if (mode === 0) {
            this.searchNumbers = 20;
        } else {
            // load more
            this.searchNumbers += 20;
        }
        this.callSearchApi(term);
    }

    private callSearchApi(term: string): void {
        this.friendsApiService.SearchEverything(term.trim(), this.searchNumbers).subscribe(result => {
            result.users.forEach(user => {
                user.avatarURL = Values.fileAddress + user.headImgFileKey;
            });
            result.groups.forEach(group => {
                group.avatarURL = Values.fileAddress + group.groupImageKey;
            });
            this.results = result;
        });
    }

    public showUsersResults(selectUsers: boolean): void {
        this.showUsers = selectUsers;
    }

    public joinGroup(groupName: string, privateGroup: boolean, id: number) {
        if (privateGroup) {
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
                    this.joinGroupWithPassword(groupName, result.value, id);
                }
            });
        } else {
            this.joinGroupWithPassword(groupName, '', id);
        }
    }

    private joinGroupWithPassword(groupName: string, password: string, id: number) {
        this.groupsApiService.JoinGroup(groupName, password).subscribe((response) => {
            if (response.code === 0) {
                this.cacheService.UpdateConversation();
                this.router.navigate(['/talking/' + id]);
            } else if (response.code === -6) {
                this.router.navigate(['/group/' + id]);
            } else {
                Swal.fire('Error', response.message, 'error');
            }
        });
}
}
