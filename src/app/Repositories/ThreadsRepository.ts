import { Injectable } from "@angular/core";
import { ThreadInfo } from "../Models/ThreadInfo";
import { ThreadsApiService } from "../Services/Api/ThreadsApiService";
import { RepositoryBase } from "./RepositoryBase";
import { lastValueFrom } from "rxjs";


@Injectable({
    providedIn: "root",
})
export class ThreadsRepository extends RepositoryBase<ThreadInfo> {

    constructor(private threadsApiService: ThreadsApiService) {
        super();
    }

    protected get name(): string {
        return "threads";
    }
    protected get version(): number {
        return 1;
    }
    protected async requestOnline(take: number, skip: number): Promise<[ThreadInfo[], number]> {
        const resp = await lastValueFrom(this.threadsApiService.List(take, skip));
        return [resp.knownThreads, resp.totalCount];
    }

}