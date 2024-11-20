import { AiurEvent } from './AiurEvent';
import { MessagePreview } from '../Message';

export interface NewMessageEvent extends AiurEvent {
    message: MessagePreview;
    previousMessageId: string;
    muted: boolean;
    mentioned: boolean;
}
