import { AiurProtocol } from '../AiurProtocal';
import { ContactInfo } from '../Contacts/ContactInfo';
import { ThreadInfoJoined } from '../ThreadInfo';

export interface UserDetailViewModel extends AiurProtocol {
    searchedUser: ContactInfo;
    commonThreads: ThreadInfoJoined[];
    commonThreadsCount: number;
    defaultThread?: number; // id
}
