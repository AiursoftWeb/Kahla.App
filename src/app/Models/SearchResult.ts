import { KahlaUser } from './KahlaUser';
import { GroupConversation } from './GroupConversation';
import { AiurProtocal } from './AiurProtocal';

export class SearchResult extends AiurProtocal {
    public usersCount: number;
    public groupsCount: number;
    public users: KahlaUser[];
    public groups: GroupConversation[];
}
