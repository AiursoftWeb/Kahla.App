import { AiurEvent } from './AiurEvent';
import { Request } from '../Request';

export interface NewFriendRequestEvent extends AiurEvent {
    request: Request;
}
