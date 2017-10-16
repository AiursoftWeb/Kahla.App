import { EventType } from './EventType';
import { AiurEvent } from './AiurEvent';

export class NewFriendRequest extends AiurEvent {
    public requesterId: string;
}
