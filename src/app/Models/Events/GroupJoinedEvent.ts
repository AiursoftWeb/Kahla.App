import { AiurEvent } from './AiurEvent';
import { Conversation } from '../Conversation';
import { Message } from '../Message';

export class GroupJoinedEvent extends AiurEvent {
    public createdConversation: Conversation;
    public messageCount: number;
    public latestMessage: Message;
}
