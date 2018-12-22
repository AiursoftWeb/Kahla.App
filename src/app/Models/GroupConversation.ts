import { Conversation } from './Conversation';

export class GroupConversation extends Conversation {
    public groupName: string;
    public groupImageKey: number;
    public hasPassword: boolean;
}
