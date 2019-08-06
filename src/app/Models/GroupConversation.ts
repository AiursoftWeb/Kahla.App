import { Conversation } from './Conversation';

export class GroupConversation extends Conversation {
    public groupName: string;
    public groupImagePath: string;
    public hasPassword: boolean;
    public ownerId: string;
}
