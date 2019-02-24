import { AiurEvent } from './AiurEvent';
import { KahlaUser } from './KahlaUser';

export class NewMessageEvent extends AiurEvent {
    public conversationId: number;
    public sender: KahlaUser;
    public content: string;
    public aesKey: string;
    public muted: boolean;
    public sentByMe: boolean;
}
