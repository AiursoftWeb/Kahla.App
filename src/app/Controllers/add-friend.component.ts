import { Component, OnInit } from '@angular/core';
import { Values } from '../values';
import { SearchResult } from '../Models/SearchResult';
import { SearchApiService } from '../Services/Api/SearchApiService';

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
        private searchApiService: SearchApiService
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
        this.searchApiService.Search(term.trim(), this.searchNumbers).subscribe(result => {
            if (result.code === 0) {
                this.results = result;
                // if (this.showUsers && result.totalUsersCount === 0 && result.groupsCount !== 0) {
                //     this.showUsers = false;
                // } else if (!this.showUsers && result.groupsCount === 0 && result.totalUsersCount !== 0) {
                //     this.showUsers = true;
                // }
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
