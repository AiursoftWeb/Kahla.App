import { ThreadInfoJoined } from "../Models/ThreadInfo";
import { RepositoryBase } from "./RepositoryBase";

export class MyThreadsOrderedRepository extends RepositoryBase<ThreadInfoJoined> {
    
    protected updateAllInternal(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
    protected readonly persistConfig = {
        name: 'mythreads-ordered',
        version: 1,
        persist: true,
    };

    public get canLoadMore() {
        return true;
    }

    protected loadMore(take: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

}