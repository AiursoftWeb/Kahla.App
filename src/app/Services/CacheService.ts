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
