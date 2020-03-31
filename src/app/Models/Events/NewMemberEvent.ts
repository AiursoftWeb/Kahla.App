import { AiurEvent } from './AiurEvent';
import { KahlaUser } from '../KahlaUser';

export class NewMemberEvent extends AiurEvent {
    public newMember: KahlaUser;
    public conversationId: number;
}
