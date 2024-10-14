import { Injectable } from '@angular/core';
import { CacheModel } from '../Models/CacheModel';
import { DevicesApiService } from './Api/DevicesApiService';
import { PushSubscriptionSetting } from '../Models/PushSubscriptionSetting';
import { ServerConfig } from '../Models/ServerConfig';
import { mapDeviceName } from '../Helpers/UaMapper';

@Injectable({
    providedIn: 'root',
})
export class CacheService {
    public cachedData: CacheModel;
    public totalUnread = 0;
    public totalRequests = 0;
    public updatingConversation = false;
    public serverConfig: ServerConfig;

    constructor(private devicesApiService: DevicesApiService) {}

    public reset() {
        this.cachedData = new CacheModel();
    }

    public updateThreads() {}

    public updateConversation(): void {
        // this.updatingConversation = true;
        // this.conversationApiService
        //     .All()
        //     .pipe(map((t) => t.items))
        //     .subscribe((info) => {
        //         this.updatingConversation = false;
        //         info.forEach((e) => {
        //             if (e.latestMessage != null) {
        //                 e.latestMessage.content = this.modifyMessage(
        //                     e.latestMessage.content
        //                 );
        //             }
        //             e.avatarURL = this.probeService.encodeProbeFileUrl(
        //                 e.displayImagePath
        //             );
        //         });
        //         this.cachedData.conversations = info;
        //         this.updateTotalUnread();
        //         this.saveCache();
        //     });
    }

    public updateDevice(): void {
        this.devicesApiService.MyDevices().subscribe(response => {
            let currentId = 0;
            if (localStorage.getItem('setting-pushSubscription')) {
                currentId = (<PushSubscriptionSetting>(
                    JSON.parse(localStorage.getItem('setting-pushSubscription'))
                )).deviceId;
            }
            response.items.forEach(item => {
                item.name = mapDeviceName(item.name) ?? 'Unknown device';
                if (item.id === currentId) {
                    item.name += '(Current device)';
                }
            });
            this.cachedData.devices = response.items;
            // should check if current device id has already been invalid
            if (localStorage.getItem('setting-pushSubscription')) {
                const val = JSON.parse(
                    localStorage.getItem('setting-pushSubscription')
                ) as PushSubscriptionSetting;
                if (val.deviceId && !this.cachedData.devices.find(t => t.id === val.deviceId)) {
                    // invalid id, remove it
                    val.deviceId = null;
                    localStorage.setItem('setting-pushSubscription', JSON.stringify(val));
                }
            }
            this.saveCache();
        });
    }

    public modifyMessage(content: string, modifyText: boolean = false): string {
        if (content.startsWith('[img]')) {
            return 'Photo';
        } else if (content.startsWith('[video]')) {
            return 'Video';
        } else if (content.startsWith('[file]')) {
            return 'File';
        } else if (content.startsWith('[audio]')) {
            return 'Audio';
        } else if (content.startsWith('[group]')) {
            return 'Group Invitation';
        } else if (content.startsWith('[user]')) {
            return 'Contact card';
        } else if (modifyText) {
            return 'Text';
        }
        return content;
    }

    public updateTotalUnread(): void {
        this.totalUnread = this.cachedData.conversations
            .filter(item => !item.muted)
            .map(item => item.unReadAmount)
            .reduce((a, b) => a + b, 0);
        // this.themeService.NotifyIcon = this.totalUnread; // TODO: fix this
    }

    public initCache(): void {
        if (localStorage.getItem('global-cache')) {
            this.cachedData = <CacheModel>JSON.parse(localStorage.getItem('global-cache'));
            if (this.cachedData.version !== CacheModel.VERSION) {
                this.cachedData = new CacheModel();
                this.saveCache();
            }
        } else {
            this.cachedData = new CacheModel();
        }
    }

    public saveCache(): void {
        localStorage.setItem('global-cache', JSON.stringify(this.cachedData));
    }
}
