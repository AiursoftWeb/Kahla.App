import { AiurProtocol } from '../AiurProtocal';
import { ThreadInfoJoined } from './ThreadInfo';

export interface ThreadsListApiResponse extends AiurProtocol {
    knownThreads: ThreadInfoJoined[];
    totalCount: number;
}
