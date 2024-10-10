import { KahlaUser } from './KahlaUser';
import { AiurProtocal } from './AiurProtocal';
import { GroupsResult } from './GroupsResults';

export interface SearchResult extends AiurProtocal {
    usersCount: number;
    groupsCount: number;
    users: KahlaUser[];
    groups: GroupsResult[];
}
