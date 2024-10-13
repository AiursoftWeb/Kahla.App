import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SearchResult } from "../../Models/SearchResult";
import { ApiService } from "./ApiService";
import { ContactsApiService } from "./ContactsApiService";

@Injectable()
export class SearchApiService {
    private static serverPath = '/search';

    constructor(
        private apiService: ApiService
    ) {
    }

    public Search(searchInput: string, take: number): Observable<SearchResult> {
        return this.apiService.Post(SearchApiService.serverPath + `/search-everything`, {
            SearchInput: searchInput,
            take
        });
    }
}