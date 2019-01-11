import { Injectable } from '@angular/core';
import { CacheModel } from '../Models/CacheModel';
import { FriendsApiService } from './FriendsApiService';
import { ContactInfo } from '../Models/ContactInfo';
import { Request } from '../Models/Request';
import { Values } from '../values';
import { map } from 'rxjs/operators';
import { AES, enc } from 'crypto-js';

@Injectable()
export class CacheService {
    public cachedData: CacheModel = new CacheModel();
    public totalUnread = 0;
    public totalRequests = 0;

    constructor(
        private friendsApiService: FriendsApiService
    ) { }

    public reset() {
        this.cachedData = new CacheModel();
    }

    public UpdateFriendList(data: ContactInfo[]): void {
        this.cachedData.friendList = data;
    }

    public UpdateFriendRequests(data: Request[]): void {
        this.cachedData.requests = data;
        this.totalRequests = data.filter(t => !t.completed).length;
    }

    public UpdateConversations(data: ContactInfo[]): void {
        this.cachedData.conversations = data;
        this.totalUnread = data.filter(item => !item.muted).map(item => item.unReadAmount).reduce((a, b) => a + b, 0);
    }

    public autoUpdateConversation(): void {
        this.friendsApiService.MyFriends(false)
            .pipe(map(t => t.items))
            .subscribe(info => {
                info.forEach(e => {
                    if (e.latestMessage != null) {
                        try {
                            e.latestMessage = AES.decrypt(e.latestMessage, e.aesKey).toString(enc.Utf8);
                        } catch (error) {
                            e.latestMessage = '';
                        }
                        if (e.latestMessage.startsWith('[img]')) {
                            e.latestMessage = 'Photo';
                        }
                        if (e.latestMessage.startsWith('[video]')) {
                            e.latestMessage = 'Video';
                        }
                        if (e.latestMessage.startsWith('[file]')) {
                            e.latestMessage = 'File';
                        }
                        if (e.latestMessage.startsWith('[audio]')) {
                            e.latestMessage = 'Audio';
                        }
                    }
                    e.avatarURL = Values.fileAddress + e.displayImageKey;
                });
                this.UpdateConversations(info);
            });
    }

    public autoUpdateFriends(): void {
        this.friendsApiService.MyFriends(true).subscribe(response => {
            response.items.forEach(item => {
                item.avatarURL = Values.fileAddress + item.displayImageKey;
            });
            this.cachedData.friendList = response.items;
        });
    }

    public autoUpdateRequests(): void {
        this.friendsApiService.MyRequests().subscribe(response => {
            this.cachedData.requests = response.items;
            response.items.forEach(item => {
                item.creator.avatarURL = Values.fileAddress + item.creator.headImgFileKey;
            });
            this.totalRequests = response.items.filter(t => !t.completed).length;
        });
    }
}
