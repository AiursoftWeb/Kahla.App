import { AiurProtocol } from '../AiurProtocal';
import { ThreadInfo } from '../ThreadInfo';

export interface ThreadsListApiResponse extends AiurProtocol {
    knownThreads: ThreadInfo[];
    totalCount: number;
}
