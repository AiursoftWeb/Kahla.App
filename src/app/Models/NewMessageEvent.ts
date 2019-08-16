import { AiurEvent } from './AiurEvent';
import { Message } from './Message';

export class NewMessageEvent extends AiurEvent {
    public message: Message;
    public aesKey: string;
    public muted: boolean;
    public mentioned: boolean;
}
