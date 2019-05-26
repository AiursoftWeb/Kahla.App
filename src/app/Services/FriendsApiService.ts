import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/';
import { AiurCollection } from '../Models/AiurCollection';
import { ContactInfo } from '../Models/ContactInfo';
import { AiurProtocal } from '../Models/AiurProtocal';
import { AiurValue } from '../Models/AiurValue';
import { Request } from '../Models/Request';
import { UserDetailViewModel } from '../Models/ApiModels/UserDetailViewModel';
import { ApiService } from './ApiService';
import { DiscoverUser } from '../Models/DiscoverUser';
import { SearchResult } from '../Models/SearchResult';

@Injectable()
export class FriendsApiService {
    private static serverPath = '/friendship';

    constructor(
        private apiService: ApiService
    ) {}

    public MyFriends(orderByName: boolean, take: number = 65535): Observable<AiurCollection<ContactInfo>> {
        return this.apiService.Get(FriendsApiService.serverPath + `/MyFriends?orderByName=${orderByName}&Take=${take}`);
    }

    public DeleteFriend(id: string): Observable<AiurProtocal> {
        return this.apiService.Post(FriendsApiService.serverPath + `/DeleteFriend/${id}`, {});
    }

    public CreateRequest(id: string): Observable<AiurValue<number>> {
        return this.apiService.Post(FriendsApiService.serverPath + `/CreateRequest/${id}`, {});
    }

    public CompleteRequest(id: number, accept: boolean): Observable<AiurProtocal> {
        return this.apiService.Post(FriendsApiService.serverPath + `/CompleteRequest/${id}`, {
            accept: accept
        });
    }

    public MyRequests(): Observable<AiurCollection<Request>> {
        return this.apiService.Get(FriendsApiService.serverPath + `/MyRequests`);
    }

    public SearchEverything(searchInput: string, take: number): Observable<SearchResult> {
        return this.apiService.Get(FriendsApiService.serverPath + `/SearchEverything/?searchInput=${searchInput}&take=${take}`);
    }

    public UserDetail(id: string): Observable<UserDetailViewModel> {
        return this.apiService.Get(FriendsApiService.serverPath + `/UserDetail/${id}`);
    }

    public Report(id: string, reason: string): Observable<AiurCollection<string>> {
        return this.apiService.Post(FriendsApiService.serverPath + '/ReportHim', {
            TargetUserId: id,
            Reason: reason
        });
    }

    public Discover(amount: number): Observable<AiurCollection<DiscoverUser>> {
        return this.apiService.Get(FriendsApiService.serverPath + '/DiscoverFriends?take=' + amount);
    }
}
