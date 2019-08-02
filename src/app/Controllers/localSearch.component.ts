import { Component, OnInit } from '@angular/core';
import { Values } from '../values';
import { CacheService } from '../Services/CacheService';
import { SearchResult } from '../Models/SearchResult';

@Component({
    selector: 'app-localsearch',
    templateUrl: '../Views/localSearch.html',
    styleUrls: ['../Styles/add-friend.scss',
        '../Styles/button.scss']

})
export class LocalSearchComponent implements OnInit {
    public results: SearchResult;
    public loadingImgURL = Values.loadingImgURL;
    public noResult = false;
    public showUsers = true;

    constructor(
        private cacheService: CacheService) {
    }

    public ngOnInit(): void {
        const searchBar = <HTMLTextAreaElement>document.querySelector('#searchBar');
        searchBar.focus();
    }

    public search(term: string): void {
        if (this.cacheService.cachedData.conversations) {
            this.results = Object.assign({}, this.cacheService.cachedData.friends);
            this.results.users = this.results.users.filter(user => {
                const regex = RegExp(term, 'i');
                return regex.test(user.nickName) || (user.email && regex.test(user.email));
            });
            this.results.groups = this.results.groups.filter(group => {
                const regex = RegExp(term, 'i');
                return regex.test(group.name);
            });
            if (this.showUsers && this.results.users.length === 0 && this.results.groups.length !== 0) {
                this.showUsers = false;
            } else if (!this.showUsers && this.results.groups.length === 0 && this.results.users.length !== 0) {
                this.showUsers = true;
            }
            this.noResult = this.results.users.length + this.results.groups.length === 0;
            const searchBar = <HTMLTextAreaElement>document.querySelector('#searchBar');
            searchBar.focus();
        }
    }

    public showUsersResults(selectUsers: boolean): void {
        this.showUsers = selectUsers;
    }
}
