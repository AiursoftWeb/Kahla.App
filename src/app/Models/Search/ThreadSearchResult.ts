import { AiurProtocol } from '../AiurProtocal';
import { ThreadInfo } from '../ThreadInfo';

export interface ThreadSearchResult extends AiurProtocol {
    totalThreadsCount: number;
    threads: ThreadInfo[];
}
