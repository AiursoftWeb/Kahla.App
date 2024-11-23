import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/';
import { ApiService } from './ApiService';
import { ThreadsListApiResponse } from '../../Models/Threads/ThreadsListApiResponse';
import { AiurValueNamed } from '../../Models/AiurValue';
import { ThreadOptions } from '../../Models/Threads/ThreadOptions';
import { ThreadInfo, ThreadInfoJoined } from '../../Models/ThreadInfo';
import { AiurProtocol } from '../../Models/AiurProtocal';
import { ThreadMembersApiResponse } from '../../Models/Threads/ThreadMembersApiResponse';

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

    public DetailsJoined(
        id: number,
        take = 1,
        skip = 0
    ): Observable<AiurValueNamed<ThreadInfoJoined, 'thread'>> {
        return this.apiService.Get(ThreadsApiService.serverPath + `/details-joined/${id}`, {
            take,
            skip,
        });
    }

    public DetailsAnnoymous(
        id: number,
        take = 1,
        skip = 0
    ): Observable<AiurValueNamed<ThreadInfo, 'thread'>> {
        return this.apiService.Get(ThreadsApiService.serverPath + `/details-annoymous/${id}`, {
            take,
            skip,
        });
    }

    public HardInvite(userId: string): Observable<AiurValueNamed<number, 'newThreadId'>> {
        return this.apiService.Post(ThreadsApiService.serverPath + `/hard-invite/${userId}`, {});
    }

    public CreateScratch(
        options: Omit<ThreadOptions, 'iconFilePath'>
    ): Observable<AiurValueNamed<number, 'newThreadId'>> {
        return this.apiService.Post(ThreadsApiService.serverPath + '/create-scratch', options);
    }

    public SetMute(id: number, value: boolean): Observable<AiurProtocol> {
        return this.apiService.Post(ThreadsApiService.serverPath + `/set-mute/${id}`, {
            mute: value,
        });
    }

    public Members(id: number, take: number, skip: number): Observable<ThreadMembersApiResponse> {
        return this.apiService.Get(ThreadsApiService.serverPath + `/members/${id}`, { take, skip });
    }
}
