import { Component, OnInit } from '@angular/core';
import { Values } from '../values';
import { HeaderService } from '../Services/HeaderService';
import { CacheService } from '../Services/CacheService';
import { SearchResult } from '../Models/SearchResult';

@Component({
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
        private cacheService: CacheService,
        private headerService: HeaderService) {
            this.headerService.title = 'Local Search';
            this.headerService.returnButton = true;
            this.headerService.button = false;
            this.headerService.shadow = false;
            this.headerService.timer = false;
        }

    public ngOnInit(): void {
    }

    public search(term: string): void {
        if (this.cacheService.cachedData.conversations) {
            this.results = Object.assign({}, this.cacheService.cachedData.friends);
            this.results.users = this.results.users.filter(user => {
                const regex = RegExp(term, 'i');
                return regex.test(user.nickName);
            }).concat(this.results.users.filter(user => {
                if (user.email) {
                    const regex = RegExp(term, 'i');
                    return regex.test(user.email);
                }
            }));
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
