import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/';
import { UserDetailViewModel } from '../../Models/ApiModels/UserDetailViewModel';
import { ApiService } from './ApiService';
import { ContactsListApiResponse } from '../../Models/Contacts/ContactsListApiResponse';
import { ThreadsListApiResponse } from '../../Models/Threads/ThreadsListApiResponse';

@Injectable()
export class ThreadsApiService {
    private static serverPath = '/threads';

    constructor(private apiService: ApiService) {}

    public List(
        take: number = 20,
        skip: number = 0,
        searchInput?: string,
        excluding?: string
    ): Observable<ThreadsListApiResponse> {
        return this.apiService.Get(ThreadsApiService.serverPath + '/list', {
            take,
            skip,
            searchInput,
            excluding,
        });
    }

    public Details(id: string): Observable<UserDetailViewModel> {
        return this.apiService.Get(ThreadsApiService.serverPath + `/details/${id}`);
    }

    public Members(
        id: number,
        take: number = 20,
        skip: number = 0
    ): Observable<ContactsListApiResponse> {
        return this.apiService.Get(ThreadsApiService.serverPath + `/members/${id}`, {
            take,
            skip,
        });
    }

    public HardInvite(userId: string) {
        return this.apiService.Post(ThreadsApiService.serverPath + `/hard-invite/${userId}`, {});
    }
}
