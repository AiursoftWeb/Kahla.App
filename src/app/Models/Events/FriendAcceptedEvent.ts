import { AiurEvent } from './AiurEvent';
import { KahlaUser } from '../KahlaUser';

export class FriendAcceptedEvent extends AiurEvent {
    public target: KahlaUser;
}
