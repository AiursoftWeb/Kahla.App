import { KahlaUser } from './KahlaUser';
import { AiurProtocol } from './AiurProtocal';
import { GroupsResult } from './GroupsResults';

export interface SearchResult extends AiurProtocol {
    usersCount: number;
    groupsCount: number;
    users: KahlaUser[];
    groups: GroupsResult[];
}
