import { debounceTime, Subject } from "rxjs";

class CacheEntry<T> {
    getAsync(): Promise<T> {
        if (this.item != null) {
            return Promise.resolve(this.item);
        } else {
            return this.itemLoader;
        }
    }

    getSync(): T | null {
        return this.item ?? null;
    }

    constructor(
        private item?: T,
        private itemLoader?: Promise<T>,
        public readonly cachedTime = new Date()
    ) {
        if (item == null && itemLoader == null) {
            throw new Error('item and itemLoader cannot be both null');
        }

        if (item != null && itemLoader != null) {
            throw new Error('item and itemLoader cannot be both set');
        }

        if (itemLoader != null) {
            itemLoader.then(value => {
                this.item = value;
                this.itemLoader = null;
            });
        }
    }
}

interface PersistCacheEntry<T> {
    value: T;
    cachedTime: number;
}

export abstract class CachedDictionaryBase<TKey, TValue> {
    protected cache = new Map<TKey, CacheEntry<TValue>>();

    protected savePersist$ = new Subject<void>();

    constructor(
        public readonly ttlSeconds: number,
        public readonly persistKey?: string
    ) {
        if (this.persistKey != null) {
            const persistCache = localStorage.getItem('cache-dict-' + this.persistKey);
            if (persistCache) {
                const cacheEntries = new Map<TKey, PersistCacheEntry<TValue>>(
                    JSON.parse(persistCache)
                );
                cacheEntries.forEach((value, key) => {
                    this.cache.set(
                        key,
                        new CacheEntry<TValue>(value.value, null, new Date(value.cachedTime))
                    );
                });
            }

            this.savePersist$.pipe(debounceTime(1000)).subscribe(() => {
                this.saveToStorage();
            });
        }
    }

    public async get(key: TKey): Promise<TValue> {
        if (
            this.cache.has(key) &&
            new Date().getTime() - this.cache.get(key).cachedTime.getTime() < this.ttlSeconds * 1000
        ) {
            return await this.cache.get(key).getAsync();
        } else {
            const value = this.cacheMiss(key);
            this.cache.set(key, new CacheEntry<TValue>(null, value));
            const valComputed = await value;
            this.savePersist$.next();
            return valComputed;
        }
    }

    public set(key: TKey, value: TValue) {
        this.cache.set(key, new CacheEntry<TValue>(value));
    }

    public saveToStorage() {
        if (this.persistKey == null) return;
        const persistCache = new Map<TKey, PersistCacheEntry<TValue>>();
        this.cache.forEach((value, key) => {
            if (
                value.getSync() != null &&
                new Date().getTime() - value.cachedTime.getTime() < this.ttlSeconds * 1000
            )
                persistCache.set(key, {
                    value: value.getSync(),
                    cachedTime: value.cachedTime.getTime(),
                });
        });

        localStorage.setItem('cache-dict-' + this.persistKey, JSON.stringify(Array.from(persistCache.entries())));
    }

    protected abstract cacheMiss(key: TKey): Promise<TValue>;
}
