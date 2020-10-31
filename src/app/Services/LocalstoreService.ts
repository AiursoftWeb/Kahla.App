import { Injectable } from '@angular/core';

@Injectable()
export class LocalStoreService {
    public static readonly STORAGE_SERVER_CONFIG = 'serverConfig';
    public static readonly PUSH_SUBSCRIPTION = 'setting-pushSubscription';

    public resetAll() {
        localStorage.clear();
    }

    public reset(key: string) {
        localStorage.removeItem(key);
    }

    public get<T>(key: string, creator: new () => T): T {
        const localStore = localStorage.getItem(key);
        if (localStore) {
            const result = JSON.parse(localStore) as T;
            return result;
        } else {
            const newStore = new creator();
            return newStore;
        }
    }

    public replace<T>(key: string, newObject: T): void {
        localStorage.setItem(key, JSON.stringify(newObject));
    }

    public update<T>(key: string, creator: new () => T, action: (source: T) => void) {
        const saved = this.get(key, creator);
        action(saved);
        this.replace<T>(key, saved);
    }
}
