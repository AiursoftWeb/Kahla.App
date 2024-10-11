import { AiurProtocol } from '../AiurProtocal';
import { ContactInfo } from '../Contacts/ContactInfo';

export interface UserDetailViewModel extends AiurProtocol {
    detailedUser: ContactInfo;
}
