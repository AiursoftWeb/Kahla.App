import { AiurEvent } from './AiurEvent';
import { Request } from '../Request';

export class NewFriendRequestEvent extends AiurEvent {
    public request: Request;
}
