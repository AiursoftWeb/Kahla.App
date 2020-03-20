import { AiurEvent } from './AiurEvent';
import { KahlaUser } from '../KahlaUser';

export class WereDeletedEvent extends AiurEvent {
    public trigger: KahlaUser;
}
