import { Injectable } from '@angular/core';
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

    public async getMe(allowCache = true): Promise<KahlaUser> {
        let me = this.localStore.get(LocalStoreService.ME_CONFIG, KahlaUser);
        if (!allowCache || !me.id) {
            console.warn('Cache not available. Trying to refetch...');
            me = await this.fetchMe();
        }
        this.localStore.replace(LocalStoreService.SERVER_CONFIG, me);
        return me;
    }

    public async getAvatarUrl() {
        const me = await this.getMe();
        return this.probeService.encodeProbeFileUrl(me.iconFilePath);
    }
}
