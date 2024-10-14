import { ThreadInfo } from '../ThreadInfo';

export class ThreadsListApiResponse {
    public knownThreads: ThreadInfo[];
    public totalCount: number;
}
