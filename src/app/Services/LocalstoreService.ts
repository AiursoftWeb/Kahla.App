import { Injectable } from '@angular/core';

@Injectable()
export class LocalStoreService {
    public static readonly SERVERS_STORE = 'official-servers';
    public static readonly SERVER_CONFIG = 'server-config';
    public static readonly PUSH_SUBSCRIPTION = 'push-subscription-config';
    public static readonly REMOTE_DEVICES = 'remote-devices';

    public resetAll() {
        localStorage.clear();
    }

    public reset(key: string) {
        localStorage.removeItem(key);
    }

    public get<T>(key: string, creator: new () => T): T {
        const localStore = localStorage.getItem(key);
        let result: T = null;
        if (localStore) {
            result = JSON.parse(localStore) as T;
        }
        if (!result) {
            const newStore = new creator();
            result = newStore;
        }
        return result;
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
