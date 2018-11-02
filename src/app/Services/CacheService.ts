import { Injectable, OnInit } from '@angular/core';
import { CacheModel } from '../Models/CacheModel';
import { FriendsApiService } from './FriendsApiService';
import { ContactInfo } from '../Models/ContactInfo';
import { Request } from '../Models/Request';

@Injectable()
export class CacheService {
    public static cachedData: CacheModel = new CacheModel();

    constructor(
        private friendsApiService: FriendsApiService
    ) { }

    public GetFriendList(): ContactInfo[] {
        return CacheService.cachedData.friendList;
    }

    public GetFriendRequests(): Request[] {
        return CacheService.cachedData.requests;
    }

    public GetConversations(): ContactInfo[] {
        return CacheService.cachedData.conversations;
    }

    public UpdateFriendList(data: ContactInfo[]): void {
        CacheService.cachedData.friendList = data;
    }

    public UpdateFriendRequests(data: Request[]): void {
        CacheService.cachedData.requests = data;
    }

    public UpdateConversations(data: ContactInfo[]): void {
        CacheService.cachedData.conversations = data;
    }

    public AutoUpdateUnread(initAble: OnInit): void {
        this.friendsApiService.MyFriends(false).subscribe(model => {
            CacheService.cachedData.conversations = model.items;
            if (initAble) {
                initAble.ngOnInit();
            }
        });
    }

    public AutoUpdateConversations(initAble: OnInit): void {
        this.friendsApiService.MyRequests().subscribe(model => {
            CacheService.cachedData.requests = model.items;
            if (initAble) {
                initAble.ngOnInit();
            }
        });
    }
}
