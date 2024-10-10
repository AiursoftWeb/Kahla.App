import { AiurEvent } from './AiurEvent';
import { Message } from '../Message';

export interface NewMessageEvent extends AiurEvent {
    message: Message;
    previousMessageId: string;
    muted: boolean;
    mentioned: boolean;
}
