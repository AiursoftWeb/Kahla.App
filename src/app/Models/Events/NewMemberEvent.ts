import { AiurEvent } from './AiurEvent';
import { KahlaUser } from '../KahlaUser';

export interface NewMemberEvent extends AiurEvent {
    newMember: KahlaUser;
    conversationId: number;
}
