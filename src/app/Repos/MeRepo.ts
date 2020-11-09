import { Injectable } from '@angular/core';
import { CachedResponse } from '../Models/CachedResponse';
import { KahlaUser } from '../Models/KahlaUser';
import { AuthApiService } from '../Services/Api/AuthApiService';
import { LocalStoreService } from '../Services/LocalstoreService';
import { ProbeService } from '../Services/ProbeService';

@Injectable()
export class MeRepo {
    constructor(
        private authApiService: AuthApiService,
        private localStore: LocalStoreService,
        private probeService: ProbeService) {

    }

    private async fetchMe(): Promise<KahlaUser> {
        const me = await this.authApiService.Me();
        if (me.code === 0) {
            this.localStore.replace(LocalStoreService.ME_CONFIG, me.value);
            return me.value;
        } else {
            throw new Error('Fetch me failed! Please consider reconnect.');
        }
    }

    public async getMe(allowCache = true): Promise<CachedResponse<KahlaUser>> {
        let me = this.localStore.get(LocalStoreService.ME_CONFIG, KahlaUser);
        let latest = false;
        if (!allowCache || !me.id) {
            console.warn('Cache not available. Trying to refetch...');
            me = await this.fetchMe();
            latest = true;
        }
        return {
            isLatest: latest,
            response: me
        };
    }

    public overrideCache(newMe: KahlaUser) {
        this.localStore.replace(LocalStoreService.ME_CONFIG, newMe);
    }

    public async getAvatarUrl(allowCache = true): Promise<CachedResponse<string>> {
        const me = await this.getMe(allowCache);
        return {
            isLatest: me.isLatest,
            response: this.probeService.encodeProbeFileUrl(me.response.iconFilePath)
        };
    }
}
