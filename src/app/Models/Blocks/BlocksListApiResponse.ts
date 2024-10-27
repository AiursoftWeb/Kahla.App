import { AiurProtocol } from '../AiurProtocal';
import { ContactInfo } from '../Contacts/ContactInfo';

export interface BlocksListApiResponse extends AiurProtocol {
    knownBlocks: ContactInfo[];
    totalKnownBlocks: number;
}
