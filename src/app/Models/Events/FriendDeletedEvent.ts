import { AiurEvent } from './AiurEvent';
import { KahlaUser } from '../KahlaUser';

export interface FriendDeletedEvent extends AiurEvent {
    trigger: KahlaUser;
    conversationId: number;
}
