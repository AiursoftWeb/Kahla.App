import { Injectable } from '@angular/core';
import { AiurCollection } from '../../Models/AiurCollection';
import { AiurProtocal } from '../../Models/AiurProtocal';
import { AiurValue } from '../../Models/AiurValue';
import { Request } from '../../Models/Request';
import { UserDetailViewModel } from '../../Models/ApiModels/UserDetailViewModel';
import { ApiService } from './ApiService';
import { DiscoverUser } from '../../Models/DiscoverUser';
import { SearchResult } from '../../Models/SearchResult';

@Injectable()
export class FriendsApiService {
    private static serverPath = '/friendship';

    constructor(
        private apiService: ApiService
    ) {
    }

    public Mine() {
        return this.apiService.Get<SearchResult>(FriendsApiService.serverPath + '/Mine');
    }

    public DeleteFriend(id: string) {
        return this.apiService.Post<AiurProtocal>(FriendsApiService.serverPath + `/DeleteFriend/${id}`, {});
    }

    public CreateRequest(id: string) {
        return this.apiService.Post<AiurValue<number>>(FriendsApiService.serverPath + `/CreateRequest/${id}`, {});
    }

    public CompleteRequest(id: number, accept: boolean) {
        return this.apiService.Post<AiurProtocal>(FriendsApiService.serverPath + `/CompleteRequest/${id}`, {
            accept: accept
        });
    }

    public MyRequests() {
        return this.apiService.Get<AiurCollection<Request>>(FriendsApiService.serverPath + `/MyRequests`);
    }

    public SearchEverything(searchInput: string, take: number) {
        return this.apiService.Get<SearchResult>(FriendsApiService.serverPath +
            `/SearchEverything/?searchInput=${searchInput}&take=${take}`);
    }

    public UserDetail(id: string) {
        return this.apiService.Get<UserDetailViewModel>(FriendsApiService.serverPath + `/UserDetail/${id}`);
    }

    public Report(id: string, reason: string) {
        return this.apiService.Post<AiurCollection<string>>(FriendsApiService.serverPath + '/ReportHim', {
            TargetUserId: id,
            Reason: reason
        });
    }

    public Discover(amount: number) {
        return this.apiService.Get<AiurCollection<DiscoverUser>>(FriendsApiService.serverPath + '/DiscoverFriends?take=' + amount);
    }
}
