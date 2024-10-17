import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/';
import { UserDetailViewModel } from '../../Models/ApiModels/UserDetailViewModel';
import { ApiService } from './ApiService';
import { ContactsListApiResponse } from '../../Models/Contacts/ContactsListApiResponse';
import { ThreadsListApiResponse } from '../../Models/Threads/ThreadsListApiResponse';
import { AiurValueNamed } from '../../Models/AiurValue';

@Injectable()
export class ThreadsApiService {
    private static serverPath = '/threads';

    constructor(private apiService: ApiService) {}

    public List(
        take = 20,
        skip = 0,
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

    public Details(id: string, take = 1, skip = 0): Observable<UserDetailViewModel> {
        return this.apiService.Get(ThreadsApiService.serverPath + `/details/${id}`, {
            take,
            skip,
        });
    }

    public Members(id: number, take = 20, skip = 0): Observable<ContactsListApiResponse> {
        return this.apiService.Get(ThreadsApiService.serverPath + `/members/${id}`, {
            take,
            skip,
        });
    }

    public HardInvite(userId: string): Observable<AiurValueNamed<number, 'newThreadId'>> {
        return this.apiService.Post(ThreadsApiService.serverPath + `/hard-invite/${userId}`, {});
    }
}
