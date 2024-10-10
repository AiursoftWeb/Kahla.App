import { Conversation } from './Conversation';

export interface GroupConversation extends Conversation {
    groupName: string;
    groupImagePath: string;
    hasPassword: boolean;
    ownerId: string;
    listInSearchResult: boolean;
}
