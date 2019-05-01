import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs/';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { Values } from '../values';
import { HeaderService } from '../Services/HeaderService';
import { CacheService } from '../Services/CacheService';
import { ContactInfo } from '../Models/ContactInfo';

@Component({
    templateUrl: '../Views/localSearch.html',
    styleUrls: ['../Styles/local-search.scss',
                '../Styles/button.scss']

})
export class LocalSearchComponent implements OnInit {
    public results: Observable<ContactInfo[]> = new Observable<ContactInfo[]>();
    public loadingImgURL = Values.loadingImgURL;
    private searchTerms = new BehaviorSubject<string>('');
    public noResult = false;

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
        this.results = this.searchTerms.pipe(
            distinctUntilChanged(),
            filter(term => {
                return term.trim().length > 0;

            }),
            map(t => {
                if (this.cacheService.cachedData.conversations) {
                    const result = this.cacheService.cachedData.conversations.filter(conversation => {
                        const regex = RegExp(t, 'i');
                        return regex.test(conversation.displayName);
                    });
                    this.noResult = result.length === 0;
                    return result;
                }
            })
        );
        const searchBar = <HTMLTextAreaElement>document.querySelector('#searchBar');
        searchBar.focus();
    }

    public search(term: string): void {
        this.searchTerms.next(term.trim());
    }
}
