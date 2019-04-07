import { AiurEvent } from './AiurEvent';
import { KahlaUser } from './KahlaUser';

export class NewFriendRequestEvent extends AiurEvent {
    public requester: KahlaUser;
}
