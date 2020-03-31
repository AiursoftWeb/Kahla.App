import { AiurEvent } from './AiurEvent';
import { KahlaUser } from '../KahlaUser';

export class SomeoneLeftEvent extends AiurEvent {
    public leftUser: KahlaUser;
    public conversationId: number;
}
