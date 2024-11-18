interface CacheEntry<T> {
    item: T;
    cachedTime: Date;
}

export abstract class CachedDictionaryBase<TKey, TValue> {
    protected cache = new Map<TKey, CacheEntry<TValue>>();

    constructor(private ttlSeconds: number) {}

    public async get(key: TKey): Promise<TValue> {
        if (
            this.cache.has(key) &&
            new Date().getTime() - this.cache.get(key).cachedTime.getTime() < this.ttlSeconds * 1000
        ) {
            return this.cache.get(key).item;
        } else {
            const value = await this.cacheMiss(key);
            this.cache.set(key, {
                item: value,
                cachedTime: new Date(),
            });
            return value;
        }
    }

    public set(key: TKey, value: TValue) {
        this.cache.set(key, {
            item: value,
            cachedTime: new Date(),
        });
    }

    protected abstract cacheMiss(key: TKey): Promise<TValue>;
}
