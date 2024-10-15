import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserSearchResult } from '../../Models/SearchResult';
import { ApiService } from './ApiService';

@Injectable()
export class SearchApiService {
    private static serverPath = '/search';

    constructor(private apiService: ApiService) {}

    public SearchUsers(
        searchInput: string,
        take = 20,
        skip = 0,
        excluding?: string
    ): Observable<UserSearchResult> {
        return this.apiService.Get(SearchApiService.serverPath + `/search-users`, {
            searchInput,
            take,
            skip,
            excluding,
        });
    }
}
