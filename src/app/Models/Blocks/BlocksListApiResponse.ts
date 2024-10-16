import { ContactInfo } from '../Contacts/ContactInfo';

export interface BlocksListApiResponse {
    knownBlocks: ContactInfo[];
    totalKnownBlocks: number;
}
