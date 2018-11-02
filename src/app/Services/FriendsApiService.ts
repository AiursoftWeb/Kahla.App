import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/';
import { AiurCollection } from '../Models/AiurCollection';
import { ContactInfo } from '../Models/ContactInfo';
import { AiurProtocal } from '../Models/AiurProtocal';
import { AiurValue } from '../Models/AiurValue';
import { KahlaUser } from '../Models/KahlaUser';
import { Request } from '../Models/Request';
import { UserDetailViewModel } from '../Models/ApiModels/UserDetailViewModel';
import { ApiService } from './ApiService';

@Injectable()
export class FriendsApiService {
    private static serverPath = '/friendship';

    constructor(
        private apiService: ApiService
    ) {}

    public MyFriends(orderByName: boolean): Observable<AiurCollection<ContactInfo>> {
        return this.apiService.Get(FriendsApiService.serverPath + `/MyFriends?orderByName=${orderByName}`);
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

    public SearchFriends(nickName: string): Observable<AiurCollection<KahlaUser>> {
        return this.apiService.Get(FriendsApiService.serverPath + `/SearchFriends/?nickname=${nickName}`);
    }

    public UserDetail(id: string): Observable<UserDetailViewModel> {
        return this.apiService.Get(FriendsApiService.serverPath + `/UserDetail/${id}`);
    }
}
