import { Conversation } from '../Conversation';
import { KahlaUser } from '../KahlaUser';

export interface ContactInfo {
    user: KahlaUser;
    commonThreads?: Conversation[];
    online: boolean;
    isKnownContact: boolean;
    isBlockedByYou: boolean;
}
