import { Component, OnInit } from '@angular/core';
import { FriendsApiService } from '../Services/FriendsApiService';
import { Values } from '../values';
import { SearchResult } from '../Models/SearchResult';
import { FriendshipService } from '../Services/FriendshipService';
import { ProbeService } from '../Services/ProbeService';

@Component({
    templateUrl: '../Views/add-friend.html',
    styleUrls: ['../Styles/add-friend.scss',
        '../Styles/button.scss',
        '../Styles/reddot.scss']

})
export class AddFriendComponent implements OnInit {
    public results: SearchResult;
    public loadingImgURL = Values.loadingImgURL;
    public searching = false;
    public searchMode = 0;
    public showUsers = true;
    public searchNumbers = 0;

    constructor(
        private friendsApiService: FriendsApiService,
        public friendshipService: FriendshipService,
        private probeService: ProbeService,
    ) {
    }

    public ngOnInit(): void {
        const searchBar = <HTMLTextAreaElement>document.querySelector('#searchBar');
        searchBar.focus();
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
                    user.avatarURL = this.probeService.encodeProbeFileUrl(user.iconFilePath);
                });
                result.groups.forEach(group => {
                    group.avatarURL = this.probeService.encodeProbeFileUrl(group.imagePath);
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

    SearchBoxKeyUp(event: KeyboardEvent, value: string) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.search(value, 0);
        }
    }
}
