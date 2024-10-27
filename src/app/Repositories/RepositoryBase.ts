interface RepositoryCache<T> {
    data: T[];
    version: number;
}

export type RepositoryStatus = 'loading' | 'synced' | 'error' | 'offline' | 'uninitialized';

export interface RepositoryPersistConfig {
    name?: string;
    version?: number;
    persist: boolean;
}

export abstract class RepositoryBase<T> {
    protected abstract get persistConfig(): RepositoryPersistConfig;

    public data: T[] = [];
    public total: number;
    public status: RepositoryStatus = 'uninitialized';

    updatePromise?: Promise<void>;

    public saveCache(): void {
        localStorage.setItem(
            `repo-cache-${this.persistConfig.name!}`,
            JSON.stringify({
                data: this.data,
                version: this.persistConfig.version!,
            } satisfies RepositoryCache<T>)
        );
    }

    public updateAll(): Promise<void> {
        return this.updatePromise ?? (this.updatePromise = this.updateAllInternal());
    }

    private async updateAllInternal(): Promise<void> {
        this.status = 'loading';
        try {
            const [resp, total] = await this.requestOnline(20, 0);
            this.data = resp;
            this.total = total;
            this.status = 'synced';
            this.saveCache();
        } catch (err) {
            this.status = 'error';
            throw err;
        } finally {
            this.updatePromise = null;
        }
    }

    public async loadMore(take: number): Promise<void> {
        if (this.data.length >= this.total) {
            return;
        }
        try {
            this.status = 'loading';
            const [resp, total] = await this.requestOnline(take, this.data.length);
            this.data = this.data.concat(resp);
            this.total = total;
            this.saveCache();
        } finally {
            // When on error, new items will be rejected, but the previous items will still be kept
            this.status = 'synced';
        }
    }

    public initCache() {
        if (localStorage.getItem(`cache-${this.persistConfig.name!}`)) {
            const data = JSON.parse(
                localStorage.getItem(`cache-${this.persistConfig.name!}`)
            ) as RepositoryCache<T>;
            if (data.version !== this.persistConfig.version!) {
                this.data = [];
                this.saveCache();
            }
            this.data = data.data;
            this.status = 'offline';
        } else {
            this.data = [];
        }
    }

    public get health(): boolean {
        return this.status === 'synced' || this.status === 'loading';
    }

    public get canLoadMore(): boolean {
        return this.data.length < this.total;
    }

    protected abstract requestOnline(take: number, skip: number): Promise<[T[], number]>;
}
