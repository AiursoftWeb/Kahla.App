import { Injectable } from '@angular/core';
import { KahlaUser } from '../Models/KahlaUser';
import { AuthApiService } from '../Services/Api/AuthApiService';
import { LocalStoreService } from '../Services/LocalstoreService';

@Injectable()
export class MeRepo {
    constructor(
        private authApiService: AuthApiService,
        private localStore: LocalStoreService) {

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
}
