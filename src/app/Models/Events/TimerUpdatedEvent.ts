import { AiurEvent } from './AiurEvent';

export class TimerUpdatedEvent extends AiurEvent {
    public newTimer: number;
    public conversationId: number;
}
