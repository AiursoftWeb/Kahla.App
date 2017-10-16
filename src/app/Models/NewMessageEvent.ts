import { EventType } from './EventType';
import { AiurEvent } from './AiurEvent';
import { KahlaUser } from './KahlaUser';

export class NewMessageEvent extends AiurEvent {
    public conversationId: number;
    public sender: KahlaUser;
    public content: string;
}
