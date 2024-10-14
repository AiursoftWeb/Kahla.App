import { AiurProtocol } from '../AiurProtocal';
import { ContactInfo } from './ContactInfo';

export interface ContactsListApiResponse extends AiurProtocol {
    knownContacts: ContactInfo[];
    totalKnownContacts: number;
}
