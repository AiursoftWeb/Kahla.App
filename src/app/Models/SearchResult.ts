import { KahlaUser } from './KahlaUser';
import { AiurProtocol } from './AiurProtocal';
import { GroupsResult } from './GroupsResults';

export interface SearchResult extends AiurProtocol {
    totalUsersCount: number;
    totalThreadsCount: number;
    users: {
        user: KahlaUser;
        online: boolean;
    }[];
    threads: GroupsResult[];
}
