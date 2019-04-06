import { KahlaUser } from './KahlaUser';
import { AiurProtocal } from './AiurProtocal';
import { GroupsResult } from './GroupsResults';

export class SearchResult extends AiurProtocal {
    public usersCount: number;
    public groupsCount: number;
    public users: KahlaUser[];
    public groups: GroupsResult[];
}
