import { Injectable } from '@angular/core';
import { CacheModel } from '../Models/CacheModel';
import { ServerConfig } from '../Models/ServerConfig';

@Injectable({
    providedIn: 'root',
})
export class CacheService {
    public cachedData: CacheModel;
    public totalUnread = 0;
    public updatingConversation = false;
    public serverConfig: ServerConfig;

    public reset() {
        this.cachedData = new CacheModel();
    }

    /**
     * @deprecated
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public updateConversation(): void {}

    public modifyMessage(content: string, modifyText = false): string {
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

    public initCache(): void {
        if (localStorage.getItem('global-cache')) {
            this.cachedData = JSON.parse(localStorage.getItem('global-cache')) as CacheModel;
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
