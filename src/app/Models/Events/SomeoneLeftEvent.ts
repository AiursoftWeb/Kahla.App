import { AiurEvent } from './AiurEvent';
import { KahlaUser } from '../KahlaUser';

export interface SomeoneLeftEvent extends AiurEvent {
    leftUser: KahlaUser;
    conversationId: number;
}
