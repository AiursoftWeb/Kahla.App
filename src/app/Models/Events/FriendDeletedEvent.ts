import { AiurEvent } from './AiurEvent';
import { KahlaUser } from '../KahlaUser';

export class FriendDeletedEvent extends AiurEvent {
    public trigger: KahlaUser;
    public conversationId: number;
}
