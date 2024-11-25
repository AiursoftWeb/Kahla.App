import { Injectable, signal, WritableSignal } from '@angular/core';
import { ServerConfig } from '../Models/ServerConfig';
import { CachedObject } from '../Caching/CachedObject';
import { AuthApiService } from './Api/AuthApiService';
import { lastValueFrom } from 'rxjs';
import { MeCacheModel } from '../Models/CacheModel';

@Injectable({
    providedIn: 'root',
})
export class CacheService {
    public mine: WritableSignal<MeCacheModel>;
    public mineCache: CachedObject<MeCacheModel>;
    public totalUnread = 0;
    public serverConfig: ServerConfig;

    constructor(authApiService: AuthApiService) {
        this.mineCache = new CachedObject('mine', async () => {
            const resp = await lastValueFrom(authApiService.Me());
            return {
                me: resp.user,
                privateSettings: resp.privateSettings,
            };
        });
        this.mine = signal(this.mineCache.getSync());
        this.mineCache.itemUpdated$.subscribe(t => this.mine.set(t));
    }
}
