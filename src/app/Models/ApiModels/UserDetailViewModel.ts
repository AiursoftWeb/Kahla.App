import { AiurProtocol } from '../AiurProtocal';
import { ContactInfo } from '../Contacts/ContactInfo';
import { ThreadInfo } from '../ThreadInfo';

export interface UserDetailViewModel extends AiurProtocol {
    searchedUser: ContactInfo;
    commonThreads: ThreadInfo[];
    commonThreadsCount: number;
    defaultThread?: number; // id
}
