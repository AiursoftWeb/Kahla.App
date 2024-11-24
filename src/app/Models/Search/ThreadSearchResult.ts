import { AiurProtocol } from '../AiurProtocal';
import { ThreadInfo } from '../Threads/ThreadInfo';

export interface ThreadSearchResult extends AiurProtocol {
    totalThreadsCount: number;
    threads: ThreadInfo[];
}
