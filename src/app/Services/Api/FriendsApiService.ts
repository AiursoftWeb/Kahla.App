import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/';
import { AiurCollection } from '../../Models/AiurCollection';
import { AiurValue } from '../../Models/AiurValue';
import { UserDetailViewModel } from '../../Models/ApiModels/UserDetailViewModel';
import { ApiService } from './ApiService';
import { DiscoverUser } from '../../Models/DiscoverUser';

@Injectable()
export class FriendsApiService {
    private static serverPath = '/friendship';

    constructor(
        private apiService: ApiService
    ) {
    }


    public CreateRequest(id: string): Observable<AiurValue<number>> {
        return this.apiService.Post(FriendsApiService.serverPath + `/CreateRequest/${id}`, {});
    }


    public UserDetail(id: string): Observable<UserDetailViewModel> {
        return this.apiService.Get(FriendsApiService.serverPath + `/UserDetail/${id}`);
    }

    public Discover(amount: number): Observable<AiurCollection<DiscoverUser>> {
        return this.apiService.Get(FriendsApiService.serverPath + '/DiscoverFriends?take=' + amount);
    }
}
