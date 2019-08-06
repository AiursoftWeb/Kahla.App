import { Injectable } from '@angular/core';
import { CacheModel } from '../Models/CacheModel';
import { FriendsApiService } from './FriendsApiService';
import { Request } from '../Models/Request';
import { Values } from '../values';
import { map } from 'rxjs/operators';
import { AES, enc } from 'crypto-js';
import { DevicesApiService } from './DevicesApiService';
import { ConversationApiService } from './ConversationApiService';

@Injectable()
export class CacheService {
    public cachedData: CacheModel = new CacheModel();
    public totalUnread = 0;
    public totalRequests = 0;

    constructor(
        private friendsApiService: FriendsApiService,
        private devicesApiService: DevicesApiService,
        private conversationApiService: ConversationApiService
    ) { }

    public reset() {
        this.cachedData = new CacheModel();
    }

    public updateFriendRequests(data: Request[]): void {
        this.cachedData.requests = data;
        this.totalRequests = data.filter(t => !t.completed).length;
    }

    public updateConversation(): void {
        this.conversationApiService.All()
            .pipe(map(t => t.items))
            .subscribe(info => {
                info.forEach(e => {
                    if (e.latestMessage != null) {
                        try {
                            e.latestMessage = AES.decrypt(e.latestMessage, e.aesKey).toString(enc.Utf8);
                        } catch (error) {
                            e.latestMessage = '';
                        }
                        e.latestMessage = this.modifyMessage(e.latestMessage);
                    }
                    e.avatarURL = Values.fileAddress + e.displayImagePath;
                });
                this.cachedData.conversations = info;
                this.updateTotalUnread();
            });
    }

    public updateFriends(): void {
        this.friendsApiService.Mine()
            .subscribe(result => {
                if (result.code === 0) {
                    result.users.forEach(user => {
                        user.avatarURL = Values.fileAddress + user.iconFilePath;
                    });
                    result.groups.forEach(group => {
                        group.avatarURL = Values.fileAddress + group.imagePath;
                    });

                    this.cachedData.friends = result;
                }
            });
    }

    public updateRequests(): void {
        this.friendsApiService.MyRequests().subscribe(response => {
            this.cachedData.requests = response.items;
            response.items.forEach(item => {
                item.creator.avatarURL = Values.fileAddress + item.creator.iconFilePath;
            });
            this.totalRequests = response.items.filter(t => !t.completed).length;
        });
    }

    public updateDevice(): void {
        this.devicesApiService.MyDevices().subscribe(response => {
            response.items.forEach(item => {
                if (item.name !== null && item.name.length >= 0) {
                    const deviceName = [];
                    // OS
                    if (item.name.includes('Win')) {
                        deviceName.push('Windows');
                    } else if (item.name.includes('Android')) {
                        deviceName.push('Android');
                    } else if (item.name.includes('Linux')) {
                        deviceName.push('Linux');
                    } else if (item.name.includes('iPhone') || item.name.includes('iPad')) {
                        deviceName.push('iOS');
                    } else if (item.name.includes('Mac')) {
                        deviceName.push('macOS');
                    } else {
                        deviceName.push('Unknown OS');
                    }

                    if (item.id === Number(localStorage.getItem('deviceID'))) {
                        deviceName[0] += '(Current device)';
                    }

                    // Browser Name
                    if (item.name.includes('Firefox') && !item.name.includes('Seamonkey')) {
                        deviceName.push('Firefox');
                    } else if (item.name.includes('Seamonkey')) {
                        deviceName.push('Seamonkey');
                    } else if (item.name.includes('Edge')) {
                        deviceName.push('Microsoft Edge');
                    } else if (item.name.includes('Chrome') && !item.name.includes('Chromium')) {
                        deviceName.push('Chrome');
                    } else if (item.name.includes('Chromium')) {
                        deviceName.push('Chromium');
                    } else if (item.name.includes('Safari') && (!item.name.includes('Chrome') || !item.name.includes('Chromium'))) {
                        deviceName.push('Safari');
                    } else if (item.name.includes('Opera') || item.name.includes('OPR')) {
                        deviceName.push('Opera');
                    } else if (item.name.match(/MSIE|Trident/)) {
                        deviceName.push('Internet Explorer');
                    } else {
                        deviceName.push('Unknown browser');
                    }

                    item.name = deviceName.join('-');
                }
            });
            this.cachedData.devices = response.items;
        });
    }

    public modifyMessage(content: string): string {
        let returnString = content;
        if (content.startsWith('[img]')) {
            returnString = 'Photo';
        } else if (content.startsWith('[video]')) {
            returnString = 'Video';
        } else if (content.startsWith('[file]')) {
            returnString = 'File';
        } else if (content.startsWith('[audio]')) {
            returnString = 'Audio';
        }
        return returnString;
    }

    public updateTotalUnread(): void {
        this.totalUnread = this.cachedData.conversations
            .filter(item => !item.muted).map(item => item.unReadAmount).reduce((a, b) => a + b, 0);
    }
}
