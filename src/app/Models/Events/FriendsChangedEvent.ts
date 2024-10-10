import { AiurEvent } from './AiurEvent';
import { Request } from '../Request';
import { Conversation } from '../Conversation';

export interface FriendsChangedEvent extends AiurEvent {
    request: Request;
    result: boolean;
    createdConversation: Conversation;
}
