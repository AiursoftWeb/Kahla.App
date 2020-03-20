import { AiurEvent } from './AiurEvent';
import { Request } from '../Request';
import { Conversation } from '../Conversation';

export class FriendsChangedEvent extends AiurEvent {
    public request: Request;
    public result: boolean;
    public createdConversation: Conversation;
}
