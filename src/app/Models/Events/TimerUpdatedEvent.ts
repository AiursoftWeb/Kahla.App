import { AiurEvent } from './AiurEvent';

export interface TimerUpdatedEvent extends AiurEvent {
    newTimer: number;
    conversationId: number;
}
