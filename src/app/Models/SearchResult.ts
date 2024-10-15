import { AiurProtocol } from './AiurProtocal';
import { ContactInfo } from './Contacts/ContactInfo';

export interface UserSearchResult extends AiurProtocol {
    totalUsersCount: number;
    users: ContactInfo[];
}
